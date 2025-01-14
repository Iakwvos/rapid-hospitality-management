using Microsoft.AspNetCore.Mvc;
using RapidHospitalityManagement.Api.Models;
using RapidHospitalityManagement.Api.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.Json;

namespace RapidHospitalityManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuestsController : ControllerBase
{
    private readonly SupabaseService _supabase;
    private readonly ILogger<GuestsController> _logger;
    private const string TABLE_NAME = "guests";

    public GuestsController(SupabaseService supabase, ILogger<GuestsController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Guest>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<Guest>>> GetGuests()
    {
        try
        {
            var guests = await _supabase.GetAsync<List<Guest>>($"/rest/v1/{TABLE_NAME}?select=*");
            return Ok(new { success = true, count = guests?.Count ?? 0, data = guests });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching guests");
            return StatusCode(500, new { success = false, error = "Failed to fetch guests" });
        }
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Guest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guest>> GetGuest(Guid id)
    {
        try
        {
            var guests = await _supabase.GetAsync<List<Guest>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}&select=*,reservations(*)");
            var guest = guests?.FirstOrDefault();
            
            if (guest == null)
            {
                return NotFound(new { success = false, error = "Guest not found" });
            }

            return Ok(new { success = true, data = guest });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching guest {GuestId}", id);
            return StatusCode(500, new { success = false, error = "Failed to fetch guest" });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guest), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guest>> CreateGuest([FromBody] JsonElement guestData)
    {
        try
        {
            // Convert snake_case to PascalCase and create a simplified guest object
            var guest = new
            {
                first_name = guestData.GetProperty("first_name").GetString(),
                last_name = guestData.GetProperty("last_name").GetString(),
                email = guestData.GetProperty("email").GetString(),
                phone = guestData.GetProperty("phone").GetString(),
                address = guestData.TryGetProperty("address", out var addressProp) ? addressProp.GetString() : null,
                preferences = guestData.TryGetProperty("preferences", out var prefProp) ? 
                    JsonSerializer.Deserialize<object>(prefProp.GetRawText()) : null
            };

            // Validate required fields
            if (string.IsNullOrEmpty(guest.first_name) || string.IsNullOrEmpty(guest.last_name) || 
                string.IsNullOrEmpty(guest.email) || string.IsNullOrEmpty(guest.phone))
            {
                return BadRequest(new { success = false, error = "Missing required fields" });
            }

            var createdGuest = await _supabase.PostAsync<Guest>($"/rest/v1/{TABLE_NAME}", guest);
            
            if (createdGuest == null)
            {
                return StatusCode(500, new { success = false, error = "Failed to create guest" });
            }

            return CreatedAtAction(
                nameof(GetGuest), 
                new { id = createdGuest.Id }, 
                new { success = true, data = createdGuest }
            );
        }
        catch (SupabaseException ex) when (ex.Code == "P2002")
        {
            return Conflict(new { success = false, error = "A guest with this email already exists" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest");
            return StatusCode(500, new { success = false, error = "Failed to create guest" });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Guest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guest>> UpdateGuest(Guid id, Guest guest)
    {
        try
        {
            if (id != guest.Id)
            {
                return BadRequest(new { success = false, error = "ID mismatch" });
            }

            var existingGuests = await _supabase.GetAsync<List<Guest>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingGuests?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Guest not found" });
            }

            guest.UpdatedAt = DateTime.UtcNow;
            var updatedGuest = await _supabase.PutAsync<Guest>($"/rest/v1/{TABLE_NAME}?id=eq.{id}", guest);
            return Ok(new { success = true, data = updatedGuest });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating guest {GuestId}", id);
            return StatusCode(500, new { success = false, error = "Failed to update guest" });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteGuest(Guid id)
    {
        try
        {
            var existingGuests = await _supabase.GetAsync<List<Guest>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingGuests?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Guest not found" });
            }

            await _supabase.DeleteAsync($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting guest {GuestId}", id);
            return StatusCode(500, new { success = false, error = "Failed to delete guest" });
        }
    }
} 