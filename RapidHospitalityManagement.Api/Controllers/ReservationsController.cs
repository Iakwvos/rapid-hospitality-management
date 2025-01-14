using Microsoft.AspNetCore.Mvc;
using RapidHospitalityManagement.Api.Models;
using RapidHospitalityManagement.Api.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RapidHospitalityManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly SupabaseService _supabase;
    private readonly ILogger<ReservationsController> _logger;
    private const string TABLE_NAME = "reservations";

    public ReservationsController(SupabaseService supabase, ILogger<ReservationsController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Reservation>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<Reservation>>> GetReservations()
    {
        try
        {
            // Fix the query format for Supabase nested selects
            var query = $"/rest/v1/{TABLE_NAME}?select=id,room_id,guest_id,check_in,check_out,status,total_price,special_requests,number_of_guests,payment_status,payment_method,created_at,updated_at," +
                       "room:room_id(id,number,type,price_per_night,status,bed_type,capacity,features,size_sqm,amenities,image_url,view_type,created_at,updated_at,description,gallery_urls,thumbnail_url,bathroom_count,floor)," +
                       "guest:guest_id(id,first_name,last_name,email,phone,address,avatar_url,preferences,vip_status,loyalty_points,notes,created_at,updated_at)";

            _logger.LogInformation("Executing query: {Query}", query);
            var reservations = await _supabase.GetAsync<List<Reservation>>(query);

            if (reservations == null)
            {
                _logger.LogWarning("No reservations found or failed to deserialize the response");
                return Ok(new { success = true, count = 0, data = new List<Reservation>() });
            }

            return Ok(new { success = true, count = reservations.Count, data = reservations });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching reservations: {ErrorMessage}", ex.Message);
            var errorMessage = ex.InnerException != null 
                ? $"Failed to fetch reservations: {ex.Message} - {ex.InnerException.Message}"
                : $"Failed to fetch reservations: {ex.Message}";
            
            return StatusCode(500, new { success = false, error = errorMessage });
        }
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Reservation), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Reservation>> GetReservation(Guid id)
    {
        try
        {
            var query = $"/rest/v1/{TABLE_NAME}?id=eq.{id}&select=id,room_id,guest_id,check_in,check_out,status,total_price,special_requests,number_of_guests,payment_status,payment_method,created_at,updated_at," +
                       "room:room_id(id,number,type,price_per_night,status,bed_type,capacity,features,size_sqm,amenities,image_url,view_type,created_at,updated_at,description,gallery_urls,thumbnail_url,bathroom_count,floor)," +
                       "guest:guest_id(id,first_name,last_name,email,phone,address,avatar_url,preferences,vip_status,loyalty_points,notes,created_at,updated_at)";

            var reservations = await _supabase.GetAsync<List<Reservation>>(query);
            var reservation = reservations?.FirstOrDefault();
            
            if (reservation == null)
            {
                return NotFound(new { success = false, error = "Reservation not found" });
            }

            return Ok(new { success = true, data = reservation });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching reservation {ReservationId}", id);
            return StatusCode(500, new { success = false, error = "Failed to fetch reservation" });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(Reservation), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Reservation>> CreateReservation(Reservation reservation)
    {
        try
        {
            // Parse the room_id as Guid to ensure it's valid
            if (!Guid.TryParse(reservation.RoomId, out Guid roomId))
            {
                return BadRequest(new { success = false, error = "Invalid room_id format" });
            }

            if (!Guid.TryParse(reservation.GuestId, out Guid guestId))
            {
                return BadRequest(new { success = false, error = "Invalid guest_id format" });
            }

            // Format dates in ISO 8601 format for Supabase
            string checkInStr = reservation.CheckIn.ToString("yyyy-MM-ddTHH:mm:ss");
            string checkOutStr = reservation.CheckOut.ToString("yyyy-MM-ddTHH:mm:ss");

            // Validate room availability using proper PostgREST syntax
            var query = $"/rest/v1/{TABLE_NAME}?room_id=eq.{roomId}" +
                       $"&status=neq.cancelled" +
                       $"&and=(check_in.lte.{Uri.EscapeDataString(checkOutStr)}," +
                       $"check_out.gte.{Uri.EscapeDataString(checkInStr)})";

            _logger.LogInformation("Checking room availability with query: {Query}", query);
            var existingReservations = await _supabase.GetAsync<List<Reservation>>(query);

            if (existingReservations?.Count > 0)
            {
                return BadRequest(new { success = false, error = "Room is not available for the selected dates" });
            }

            // Set default values
            reservation.Id = Guid.NewGuid();
            reservation.CreatedAt = DateTime.UtcNow;
            reservation.UpdatedAt = DateTime.UtcNow;

            // Ensure status and payment_status are set if not provided
            if (string.IsNullOrEmpty(reservation.Status))
            {
                reservation.Status = "confirmed";
            }
            if (string.IsNullOrEmpty(reservation.PaymentStatus))
            {
                reservation.PaymentStatus = "pending";
            }
            if (string.IsNullOrEmpty(reservation.PaymentMethod))
            {
                reservation.PaymentMethod = "credit_card";
            }

            _logger.LogInformation("Creating reservation with data: {@Reservation}", reservation);
            var createdReservation = await _supabase.PostAsync<Reservation>($"/rest/v1/{TABLE_NAME}", reservation);
            
            if (createdReservation == null)
            {
                return StatusCode(500, new { success = false, error = "Failed to create reservation" });
            }

            // Get the full reservation with room and guest details using proper PostgREST syntax
            var fullReservationQuery = $"/rest/v1/{TABLE_NAME}?id=eq.{createdReservation.Id}" +
                                     $"&select=*,room:room_id(*),guest:guest_id(*)";

            var fullReservations = await _supabase.GetAsync<List<Reservation>>(fullReservationQuery);
            var fullReservation = fullReservations?.FirstOrDefault();

            if (fullReservation == null)
            {
                return StatusCode(500, new { success = false, error = "Failed to retrieve created reservation" });
            }

            return CreatedAtAction(nameof(GetReservation), new { id = fullReservation.Id }, new { success = true, data = fullReservation });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating reservation: {ErrorMessage}", ex.Message);
            return StatusCode(500, new { success = false, error = "Failed to create reservation" });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Reservation), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Reservation>> UpdateReservation(Guid id, Reservation reservation)
    {
        try
        {
            if (id != reservation.Id)
            {
                return BadRequest(new { success = false, error = "ID mismatch" });
            }

            var existingReservations = await _supabase.GetAsync<List<Reservation>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingReservations?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Reservation not found" });
            }

            // If dates are being updated, check availability
            var existingReservation = existingReservations.First();
            if (existingReservation.CheckIn != reservation.CheckIn || existingReservation.CheckOut != reservation.CheckOut)
            {
                var conflictingReservations = await _supabase.GetAsync<List<Reservation>>(
                    $"/rest/v1/{TABLE_NAME}?room_id=eq.{reservation.RoomId}" +
                    $"&id=neq.{id}" +
                    $"&status=neq.cancelled" +
                    $"&and=(check_in.lte.{Uri.EscapeDataString(reservation.CheckOut.ToString("yyyy-MM-ddTHH:mm:ss"))}" +
                    $",check_out.gte.{Uri.EscapeDataString(reservation.CheckIn.ToString("yyyy-MM-ddTHH:mm:ss"))})");

                if (conflictingReservations?.Count > 0)
                {
                    return BadRequest(new { success = false, error = "Room is not available for the selected dates" });
                }
            }

            reservation.UpdatedAt = DateTime.UtcNow;
            var updatedReservation = await _supabase.PutAsync<Reservation>($"/rest/v1/{TABLE_NAME}?id=eq.{id}", reservation);
            
            if (updatedReservation == null)
            {
                return StatusCode(500, new { success = false, error = "Failed to update reservation" });
            }

            return Ok(new { success = true, data = updatedReservation });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating reservation {ReservationId}", id);
            return StatusCode(500, new { success = false, error = "Failed to update reservation" });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteReservation(Guid id)
    {
        try
        {
            var existingReservations = await _supabase.GetAsync<List<Reservation>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingReservations?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Reservation not found" });
            }

            await _supabase.DeleteAsync($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting reservation {ReservationId}", id);
            return StatusCode(500, new { success = false, error = "Failed to delete reservation" });
        }
    }
} 