import { useEffect, useState } from 'react'

export default function Widget2() {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const time = currentTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const date = currentTime.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    const weekday = currentTime.toLocaleDateString('ru-RU', {
        weekday: 'long',
    })

    return (
        <div
            style={{
                padding: '40px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '20px',
            }}
        >
            <div
                style={{
                    fontSize: '72px',
                    fontWeight: 'bold',
                }}
            >
                🕒 {time}
            </div>

            <div
                style={{
                    fontSize: '36px',
                }}
            >
                📅 {date}
            </div>

            <div
                style={{
                    fontSize: '32px',
                    textTransform: 'capitalize',
                }}
            >
                {weekday}
            </div>
        </div>
    )
}