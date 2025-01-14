using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RapidHospitalityManagement.Api.Models;

public class Room
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("number")]
    public string Number { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RoomType Type { get; set; }

    [JsonPropertyName("capacity")]
    public int Capacity { get; set; }

    [JsonPropertyName("price_per_night")]
    public decimal PricePerNight { get; set; }

    [JsonPropertyName("amenities")]
    public List<string> Amenities { get; set; } = new();

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RoomStatus Status { get; set; }

    [JsonPropertyName("floor")]
    public int Floor { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("gallery_urls")]
    public List<string> GalleryUrls { get; set; } = new();

    [JsonPropertyName("features")]
    public List<string> Features { get; set; } = new();

    [JsonPropertyName("view_type")]
    public string? ViewType { get; set; }

    [JsonPropertyName("size_sqm")]
    public decimal SizeSqm { get; set; }

    [JsonPropertyName("bed_type")]
    public string? BedType { get; set; }

    [JsonPropertyName("bathroom_count")]
    public int BathroomCount { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("reservations")]
    public List<Reservation> Reservations { get; set; } = new();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomType
{
    [JsonPropertyName("single")]
    Single,
    [JsonPropertyName("double")]
    Double,
    [JsonPropertyName("suite")]
    Suite,
    [JsonPropertyName("deluxe")]
    Deluxe
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomStatus
{
    [JsonPropertyName("available")]
    Available,
    [JsonPropertyName("occupied")]
    Occupied,
    [JsonPropertyName("maintenance")]
    Maintenance
} 