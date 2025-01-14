using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RapidHospitalityManagement.Api.Services;

public class SupabaseService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;
    private readonly JsonSerializerOptions _jsonOptions;

    public SupabaseService(IConfiguration configuration)
    {
        _supabaseUrl = configuration["Supabase:Url"] ?? throw new ArgumentNullException("Supabase:Url");
        _supabaseKey = configuration["Supabase:Key"] ?? throw new ArgumentNullException("Supabase:Key");
        
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(_supabaseUrl)
        };
        
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _supabaseKey);

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = 
            { 
                new JsonStringEnumConverter(new SnakeCaseNamingPolicy())
            }
        };
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        var response = await _httpClient.GetAsync(endpoint);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, _jsonOptions);
    }

    public async Task<T?> PostAsync<T>(string endpoint, object data) where T : class
    {
        var json = JsonSerializer.Serialize(data, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(endpoint, content);
        
        if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            throw new SupabaseException("A record with this value already exists.", "P2002");
        }
        
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();

        // If the response is empty (typical for Supabase POST), try to get the created record
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            // Extract the table name from the endpoint (e.g., "/rest/v1/guests" -> "guests")
            var table = endpoint.Split('/').Last();
            
            // Get the created record using the returning=representation Prefer header
            var selectResponse = await _httpClient.GetAsync($"{endpoint}?order=created_at.desc&limit=1");
            selectResponse.EnsureSuccessStatusCode();
            responseContent = await selectResponse.Content.ReadAsStringAsync();
            
            // Supabase returns an array, but we want a single object
            if (responseContent.StartsWith("[") && responseContent.EndsWith("]"))
            {
                var array = JsonSerializer.Deserialize<List<T>>(responseContent, _jsonOptions);
                return array?.FirstOrDefault();
            }
        }

        return JsonSerializer.Deserialize<T>(responseContent, _jsonOptions);
    }

    public async Task<T?> PutAsync<T>(string endpoint, object data) where T : class
    {
        var json = JsonSerializer.Serialize(data, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Add Prefer header to get the updated record back
        if (!_httpClient.DefaultRequestHeaders.Contains("Prefer"))
        {
            _httpClient.DefaultRequestHeaders.Add("Prefer", "return=representation");
        }
        
        var response = await _httpClient.PutAsync(endpoint, content);
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();

        // Remove the Prefer header after the request
        _httpClient.DefaultRequestHeaders.Remove("Prefer");

        // If the response is empty or we need to fetch related data
        if (string.IsNullOrWhiteSpace(responseContent) || !responseContent.Contains("room") || !responseContent.Contains("guest"))
        {
            // Extract the ID and table from the endpoint
            var parts = endpoint.Split('?')[0].Split('/');
            var table = parts[^2]; // Second to last part
            var id = parts[^1].Split('=')[^1]; // Last part after 'eq.'

            // Construct query with proper field selection
            var selectEndpoint = $"/rest/v1/{table}?id=eq.{id}&select=id,guest_id,room_id,check_in,check_out,status," +
                               $"total_price,special_requests,number_of_guests,payment_status,payment_method,created_at,updated_at," +
                               $"room:room_id(id,number,type,price_per_night,status,bed_type,capacity,features,size_sqm,amenities," +
                               $"image_url,view_type,created_at,updated_at,description,gallery_urls,thumbnail_url,bathroom_count,floor)," +
                               $"guest:guest_id(id,first_name,last_name,email,phone,address,avatar_url,preferences,vip_status," +
                               $"loyalty_points,notes,created_at,updated_at)";

            var selectResponse = await _httpClient.GetAsync(selectEndpoint);
            selectResponse.EnsureSuccessStatusCode();
            responseContent = await selectResponse.Content.ReadAsStringAsync();
        }

        try 
        {
            if (responseContent.StartsWith("[") && responseContent.EndsWith("]"))
            {
                var array = JsonSerializer.Deserialize<List<T>>(responseContent, _jsonOptions);
                return array?.FirstOrDefault();
            }
            return JsonSerializer.Deserialize<T>(responseContent, _jsonOptions);
        }
        catch (JsonException ex)
        {
            throw new SupabaseException($"Failed to deserialize response: {ex.Message}", "DESERIALIZATION_ERROR");
        }
    }

    public async Task DeleteAsync(string endpoint)
    {
        var response = await _httpClient.DeleteAsync(endpoint);
        response.EnsureSuccessStatusCode();
    }
}

public class SnakeCaseNamingPolicy : JsonNamingPolicy
{
    public override string ConvertName(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        var result = new StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            if (i > 0 && char.IsUpper(name[i]))
            {
                result.Append('_');
            }
            result.Append(char.ToLower(name[i]));
        }
        return result.ToString();
    }
}

public class SupabaseException : Exception
{
    public string Code { get; }

    public SupabaseException(string message, string code) : base(message)
    {
        Code = code;
    }
} 