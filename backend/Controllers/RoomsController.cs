using Microsoft.AspNetCore.Mvc;
using RapidHospitalityManagement.Api.Models;
using RapidHospitalityManagement.Api.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RapidHospitalityManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly SupabaseService _supabase;
    private readonly ILogger<RoomsController> _logger;
    private const string TABLE_NAME = "rooms";

    public RoomsController(SupabaseService supabase, ILogger<RoomsController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Room>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
    {
        try
        {
            var rooms = await _supabase.GetAsync<List<Room>>($"/rest/v1/{TABLE_NAME}?select=*");
            return Ok(new { success = true, count = rooms?.Count ?? 0, data = rooms });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching rooms");
            return StatusCode(500, new { success = false, error = "Failed to fetch rooms" });
        }
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Room), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Room>> GetRoom(Guid id)
    {
        try
        {
            var rooms = await _supabase.GetAsync<List<Room>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}&select=*");
            var room = rooms?.FirstOrDefault();
            
            if (room == null)
            {
                return NotFound(new { success = false, error = "Room not found" });
            }

            return Ok(new { success = true, data = room });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching room {RoomId}", id);
            return StatusCode(500, new { success = false, error = "Failed to fetch room" });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(Room), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Room>> CreateRoom(Room room)
    {
        try
        {
            room.Id = Guid.NewGuid();
            room.CreatedAt = DateTime.UtcNow;
            room.UpdatedAt = DateTime.UtcNow;

            var createdRoom = await _supabase.PostAsync<Room>($"/rest/v1/{TABLE_NAME}", room);
            return CreatedAtAction(nameof(GetRoom), new { id = createdRoom?.Id }, new { success = true, data = createdRoom });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room");
            return StatusCode(500, new { success = false, error = "Failed to create room" });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Room), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Room>> UpdateRoom(Guid id, Room room)
    {
        try
        {
            if (id != room.Id)
            {
                return BadRequest(new { success = false, error = "ID mismatch" });
            }

            var existingRooms = await _supabase.GetAsync<List<Room>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingRooms?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Room not found" });
            }

            room.UpdatedAt = DateTime.UtcNow;
            var updatedRoom = await _supabase.PutAsync<Room>($"/rest/v1/{TABLE_NAME}?id=eq.{id}", room);
            return Ok(new { success = true, data = updatedRoom });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating room {RoomId}", id);
            return StatusCode(500, new { success = false, error = "Failed to update room" });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        try
        {
            var existingRooms = await _supabase.GetAsync<List<Room>>($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            if (!existingRooms?.Any() ?? true)
            {
                return NotFound(new { success = false, error = "Room not found" });
            }

            await _supabase.DeleteAsync($"/rest/v1/{TABLE_NAME}?id=eq.{id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting room {RoomId}", id);
            return StatusCode(500, new { success = false, error = "Failed to delete room" });
        }
    }
} 