FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["RapidHospitalityManagement.Api/RapidHospitalityManagement.Api.csproj", "./"]
RUN dotnet restore
COPY RapidHospitalityManagement.Api/. .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:${PORT:-80}
ENTRYPOINT ["dotnet", "RapidHospitalityManagement.Api.dll"] 