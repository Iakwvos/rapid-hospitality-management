using System;
using System.Text.Json.Serialization;

namespace RapidHospitalityManagement.Api.Models;

public class Reservation
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("guest_id")]
    public string GuestId { get; set; } = string.Empty;

    [JsonPropertyName("room_id")]
    public string RoomId { get; set; } = string.Empty;

    [JsonPropertyName("check_in")]
    public DateTime CheckIn { get; set; }

    [JsonPropertyName("check_out")]
    public DateTime CheckOut { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("total_price")]
    public decimal TotalPrice { get; set; }

    [JsonPropertyName("special_requests")]
    public string? SpecialRequests { get; set; }

    [JsonPropertyName("number_of_guests")]
    public int NumberOfGuests { get; set; }

    [JsonPropertyName("payment_status")]
    public string PaymentStatus { get; set; } = string.Empty;

    [JsonPropertyName("payment_method")]
    public string PaymentMethod { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    [JsonPropertyName("room")]
    public Room? Room { get; set; }

    [JsonPropertyName("guest")]
    public Guest? Guest { get; set; }
} 