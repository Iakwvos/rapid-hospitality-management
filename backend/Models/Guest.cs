using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RapidHospitalityManagement.Api.Models;

public class Guest
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("preferences")]
    public GuestPreferences? Preferences { get; set; }

    [JsonPropertyName("vip_status")]
    public bool VipStatus { get; set; }

    [JsonPropertyName("loyalty_points")]
    public int LoyaltyPoints { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("reservations")]
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

public class GuestPreferences
{
    [JsonPropertyName("room_type")]
    public List<string> RoomTypes { get; set; } = new();
    
    [JsonPropertyName("special_requests")]
    public List<string> SpecialRequests { get; set; } = new();
    
    [JsonPropertyName("dietary_restrictions")]
    public List<string> DietaryRestrictions { get; set; } = new();
} 