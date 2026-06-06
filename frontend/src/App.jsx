import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Bell,
  Car,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  DoorOpen,
  Grid2X2Plus,
  Home,
  LogOut,
  MapPin,
  Monitor,
  Newspaper,
  Plus,
  Settings,
  Siren,
  UserRound,
} from 'lucide-react'
import { assignTemplate, login, logout, register } from './services/api'
import './App.css'

function AuthScreen({ mode, onModeChange, onSubmit }) {
  const isRegister = mode === 'register'

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <img className="auth-logo" src="/auth-logo.svg" alt="Ujin" />

        <form className="auth-card" onSubmit={onSubmit}>
          {isRegister ? (
            <>
              <label className="auth-field">
                <span>Имя</span>
                <input name="firstName" placeholder="Введите имя" />
              </label>

              <label className="auth-field">
                <span>Фамилия</span>
                <input name="lastName" placeholder="Введите фамилию" />
              </label>

              <label className="auth-field">
                <span>Email</span>
                <input name="email" type="email" placeholder="Введите почту" />
              </label>

              <label className="auth-field">
                <span>Пароль</span>
                <input name="password" type="password" placeholder="Введите пароль" />
              </label>

              <label className="auth-field">
                <span>Подтвердите пароль</span>
                <input name="passwordConfirm" type="password" placeholder="Введите пароль" />
              </label>

              <label className="auth-consent">
                <input type="checkbox" />
                <span>
                  Нажимая на кнопку «Зарегистрироваться» вы соглашаетесь с Политикой обработки
                  персональных данных
                </span>
              </label>

              <button className="auth-submit" type="submit">
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              <label className="auth-field">
                <span>Логин</span>
                <input name="login" placeholder="Введите логин" />
              </label>

              <label className="auth-field">
                <span>Пароль</span>
                <input name="password" type="password" placeholder="Введите пароль" />
              </label>

              <button className="auth-submit" type="submit">
                Войти
              </button>

              <button className="auth-link" type="button" onClick={() => onModeChange('register')}>
                Создать аккаунт
              </button>
            </>
          )}
        </form>

        {isRegister && (
          <button className="auth-back" type="button" onClick={() => onModeChange('login')}>
            ← Вернуться
          </button>
        )}
      </div>
    </main>
  )
}

const menuItems = [
  { id: 'houses', label: 'Дома', icon: Monitor, active: true },
  { id: 'services', label: 'Сервисы', icon: Grid2X2Plus },
  { id: 'emergency', label: 'Чрезвычайные ситуации', icon: Siren },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const houses = [
  {
    id: 1,
    title: 'Дом на Ленина',
    address: 'ул. Ленина, 24',
    apartments: 128,
    displays: [
      {
        id: 'hall',
        label: 'Холл',
        icon: DoorOpen,
        status: 'online',
        audience: 'Главный вход',
        widgets: ['Новости УК', 'Погода', 'Контакты аварийной службы'],
      },
      {
        id: 'lift',
        label: 'Лифт',
        icon: ArrowUpDown,
        status: 'online',
        audience: 'Подъезд 1',
        widgets: ['Короткие объявления', 'Реклама партнеров', 'Режим ЧС'],
      },
      {
        id: 'parking',
        label: 'Парковка',
        icon: Car,
        status: 'online',
        audience: 'Минус первый этаж',
        widgets: ['Свободные места', 'Кладовые', 'Погода'],
      },
      {
        id: 'weather',
        label: 'Погода',
        icon: CloudSun,
        status: 'draft',
        audience: 'Все экраны дома',
        widgets: ['Температура', 'Осадки', 'Ветер'],
      },
    ],
  },
  {
    id: 2,
    title: 'ЖК Северный',
    address: 'ул. Мира, 10',
    apartments: 96,
    displays: [
      {
        id: 'hall',
        label: 'Холл',
        icon: DoorOpen,
        status: 'online',
        audience: 'Ресепшн',
        widgets: ['Новости УК', 'Правила ЖК', 'Погода'],
      },
      {
        id: 'lift',
        label: 'Лифт',
        icon: ArrowUpDown,
        status: 'offline',
        audience: 'Подъезд 2',
        widgets: ['Объявления', 'Режим ЧС'],
      },
      {
        id: 'parking',
        label: 'Парковка',
        icon: Car,
        status: 'online',
        audience: 'Паркинг',
        widgets: ['Свободные места', 'Кладовые'],
      },
    ],
  },
  {
    id: 3,
    title: 'Дом на Парковой',
    address: 'ул. Парковая, 7',
    apartments: 84,
    displays: [
      {
        id: 'hall',
        label: 'Холл',
        icon: DoorOpen,
        status: 'online',
        audience: 'Главный холл',
        widgets: ['Новости УК', 'График вывоза мусора', 'Контакты'],
      },
      {
        id: 'info',
        label: 'Инфо',
        icon: Newspaper,
        status: 'draft',
        audience: 'Все подъезды',
        widgets: ['Постоянная информация', 'Бонусы партнеров'],
      },
    ],
  },
  {
    id: 4,
    title: 'ЖК Южный',
    address: 'ул. Строителей, 18',
    apartments: 112,
    displays: [
      {
        id: 'hall',
        label: 'Холл',
        icon: DoorOpen,
        status: 'online',
        audience: 'Первый этаж',
        widgets: ['Новости УК', 'Погода', 'Контакты аварийной службы'],
      },
      {
        id: 'lift',
        label: 'Лифт',
        icon: ArrowUpDown,
        status: 'online',
        audience: 'Подъезд 3',
        widgets: ['Короткие объявления', 'Реклама партнеров'],
      },
      {
        id: 'parking',
        label: 'Парковка',
        icon: Car,
        status: 'draft',
        audience: 'Гостевая парковка',
        widgets: ['Свободные места', 'Правила парковки'],
      },
    ],
  },
  {
    id: 5,
    title: 'Башня Восток',
    address: 'ул. Советская, 41',
    apartments: 156,
    displays: [
      {
        id: 'reception',
        label: 'Ресепшн',
        icon: DoorOpen,
        status: 'online',
        audience: 'Главная стойка',
        widgets: ['Новости УК', 'Погода', 'Правила ЖК'],
      },
      {
        id: 'lift',
        label: 'Лифт',
        icon: ArrowUpDown,
        status: 'online',
        audience: 'Все лифты',
        widgets: ['Короткие объявления', 'Режим ЧС'],
      },
      {
        id: 'info',
        label: 'Инфо',
        icon: Newspaper,
        status: 'draft',
        audience: 'Общие экраны',
        widgets: ['Постоянная информация', 'Бонусы партнеров', 'RSS-лента'],
      },
      {
        id: 'weather',
        label: 'Погода',
        icon: CloudSun,
        status: 'online',
        audience: 'Все экраны дома',
        widgets: ['Температура', 'Осадки', 'Ветер'],
      },
    ],
  },
]

function App() {
  const [selectedHouseId, setSelectedHouseId] = useState(houses[0].id)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [view, setView] = useState('home')
  const [authMode, setAuthMode] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('Admin')

  const visibleHouses = useMemo(
    () => Array.from({ length: 4 }, (_, index) => houses[(carouselIndex + index) % houses.length]),
    [carouselIndex],
  )

  const selectedHouse = useMemo(
    () => houses.find((house) => house.id === selectedHouseId) || houses[0],
    [selectedHouseId],
  )

  function selectHouse(house) {
    setSelectedHouseId(house.id)
    setView('address')
  }

  function shiftCarousel(direction) {
    setCarouselIndex((currentIndex) => {
      const nextIndex = currentIndex + direction

      return (nextIndex + houses.length) % houses.length
    })
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const nextName = authMode === 'register' ? formData.get('firstName') : formData.get('login')

    const payload =
      authMode === 'register'
        ? {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            passwordConfirm: formData.get('passwordConfirm'),
          }
        : {
            login: formData.get('login'),
            password: formData.get('password'),
          }

    try {
      if (authMode === 'register') {
        await register(payload)
      } else {
        await login(payload)
      }
    } catch (error) {
      console.warn('Auth API is not ready yet, using demo mode.', error)
    }

    setCurrentUserName(nextName || 'Admin')
    setIsAuthenticated(true)
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.warn('Logout API is not ready yet, using demo mode.', error)
    }

    setIsAuthenticated(false)
    setAuthMode('login')
  }

  async function handleSendTemplate() {
    try {
      await assignTemplate({
        houseId: selectedHouse.id,
        displayIds: selectedHouse.displays.map((display) => display.id),
        templateId: 'default-dashboard',
      })
    } catch (error) {
      console.warn('Template API is not ready yet, using demo mode.', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    )
  }

  return (
    <div className="app-shell">
      <aside className="nav-bar" aria-label="Основная навигация">
        <a className="logo" href="/" aria-label="Главная">
          <img className="logo-image" src="/logo.png" alt="Логотип УК" />
        </a>

        <nav className="menu">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                aria-label={item.label}
                className={item.active ? 'menu-button is-active' : 'menu-button'}
                key={item.id}
                title={item.label}
                type="button"
              >
                <Icon size={22} strokeWidth={1.8} />
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="app-header">
          <div className="header-brand">
            <h1>Название/лого УК</h1>
          </div>

          <div className="header-actions">
            <button className="header-icon-button" type="button" aria-label="Уведомления">
              <Bell size={18} />
            </button>

            <div className="roleuser" aria-label="Профиль пользователя">
              <span className="roleuser-avatar">
                <UserRound size={16} />
              </span>
              <span>{currentUserName}</span>
            </div>

            <button
              className="logout-button"
              type="button"
              aria-label="Выйти из аккаунта"
              onClick={handleLogout}
            >
              <LogOut size={22} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        <main className={view === 'home' ? 'content home-page' : 'content address-page'}>
          {view === 'home' ? (
            <>
              <section className="content-heading">
                <div>
                  <h2>Подключенные дома</h2>
                  <p>Адреса, группы экранов и шаблоны для дисплеев ЖК</p>
                </div>

                <button className="add-house-button" type="button">
                  <Plus size={24} strokeWidth={2.6} />
                  <span>Добавить дом</span>
                </button>
              </section>

              <section className="houses-carousel" aria-label="Подключенные дома">
                <button
                  className="carousel-button"
                  type="button"
                  aria-label="Показать предыдущий адрес"
                  onClick={() => shiftCarousel(-1)}
                >
                  <ChevronLeft size={22} />
                </button>

                <div className="houses-viewport">
                  <div className="houses-grid">
                    {visibleHouses.map((house) => (
                      <button
                        aria-label={`Открыть экраны адреса ${house.title}`}
                        className="background"
                        key={house.id}
                        type="button"
                        onClick={() => selectHouse(house)}
                      >
                        <div className="house-icon">
                          <Home size={22} />
                        </div>

                        <div className="house-info">
                          <h3>{house.title}</h3>
                          <p>{house.address}</p>
                          <span>{house.apartments} квартир</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="carousel-button"
                  type="button"
                  aria-label="Показать следующий адрес"
                  onClick={() => shiftCarousel(1)}
                >
                  <ChevronRight size={22} />
                </button>
              </section>
            </>
          ) : (
            <section className="address-detail" aria-label="Экраны выбранного адреса">
              <button className="back-button" type="button" onClick={() => setView('home')}>
                <ChevronLeft size={18} />
                <span>К адресам</span>
              </button>

              <div className="address-summary">
                <div>
                  <span className="section-kicker">Экраны адреса</span>
                  <h2>{selectedHouse.title}</h2>
                  <p>
                    <MapPin size={16} />
                    {selectedHouse.address}
                  </p>
                </div>

                <button className="send-template-button" type="button" onClick={handleSendTemplate}>
                  Отправить шаблон
                </button>
              </div>

              <div className="display-cards-grid" aria-label="Места размещения экранов">
                {selectedHouse.displays.map((display) => {
                  const DisplayIcon = display.icon

                  return (
                    <article className="display-card" key={display.id}>
                      <span className={`status-pill ${display.status}`}>
                        {display.status === 'online'
                          ? 'online'
                          : display.status === 'offline'
                            ? 'offline'
                            : 'черновик'}
                      </span>

                      <div className="display-title">
                        <DisplayIcon size={24} />
                        <div>
                          <h3>{display.label}</h3>
                          <p>{display.audience}</p>
                        </div>
                      </div>

                      <div className="widget-list">
                        {display.widgets.map((widget) => (
                          <span key={widget}>{widget}</span>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App