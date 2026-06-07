import { useEffect, useState } from "react";

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        Promise.resolve()
            .then(async () => {
                const url =
                    "https://api.open-meteo.com/v1/forecast" +
                    "?latitude=55.7558" +
                    "&longitude=37.6173" +
                    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max" +
                    "&timezone=Europe%2FMoscow" +
                    "&forecast_days=1";

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Ошибка загрузки погоды");
                }

                return response.json();
            })
            .then((data) => {
                if (!ignore) {
                    setWeather(data.daily);
                }
            })
            .catch((err) => {
                if (!ignore) {
                    setError(err.message);
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!weather) {
        return <div>Загрузка погоды...</div>;
    }

    return (
        <div className="weather-widget">
            <h2>Погода</h2>
            <h2>в МСК</h2>

            {weather.time.map((date, index) => (
                <div className="weather-day" key={date}>
                    <div>{date}</div>
                    <div>
                        {Math.round(weather.temperature_2m_min[index])}° /{" "}
                        {Math.round(weather.temperature_2m_max[index])}°
                    </div>
                    <div>Осадки: {weather.precipitation_sum[index]} мм</div>
                    <div>Ветер: {weather.wind_speed_10m_max[index]} км/ч</div>
                </div>
            ))}
        </div>
    );
}
