import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpDown,
  Bell,
  Car,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Grid2X2Plus,
  Home,
  LogOut,
  MapPin,
  Monitor,
  Search,
  Siren,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import {
  activateEmergency,
  assignTemplate,
  createScreenCode,
  getNewScreen,
  login,
  logout,
  register,
  resetEmergency,
  saveTemplate,
} from './services/api'
import './App.css'

const TEMPLATE_COLUMNS = 12
const TEMPLATE_ROW_HEIGHT = 54
const TEMPLATE_GAP = 10
const TEMPLATE_PADDING = 10

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
  { id: 'houses', label: 'Дома', icon: Monitor, view: 'home' },
  { id: 'services', label: 'Сервисы', icon: Grid2X2Plus, view: 'templates' },
  { id: 'emergency', label: 'Чрезвычайные ситуации', icon: Siren, view: 'emergency' },
]

const groupTitles = {
  hall: 'Холлы',
  lift: 'Лифты',
  parking: 'Парковки',
}

const statusMeta = {
  online: {
    label: 'Онлайн',
    description: 'устройство подключено и работает',
  },
  offline: {
    label: 'Оффлайн',
    description: 'устройство не отвечает',
  },
  pending: {
    label: 'В ожидании',
    description: 'устройство ждет подключения',
  },
  emergency: {
    label: 'ЧС',
    description: 'на устройстве включен режим чрезвычайной ситуации',
  },
}

const screenDevices = {
  1: {
    hall: [
      {
        id: '#TV-001',
        name: 'Hall - section 1',
        location: '1 этаж, 1 очередь',
        status: 'online',
        template: 'Утренние новости',
      },
      {
        id: '#TV-002',
        name: 'Hall - section 2',
        location: '1 этаж, 2 очередь',
        status: 'pending',
        template: 'Погода',
      },
      {
        id: '#TV-003',
        name: 'Hall - section 3',
        location: '1 этаж, 3 очередь',
        status: 'emergency',
        template: 'Режим ЧС',
      },
      {
        id: '#TV-004',
        name: 'Hall - section 4',
        location: '1 этаж, 4 очередь',
        status: 'online',
        template: 'Погода',
      },
      {
        id: '#TV-005',
        name: 'Hall - section 5',
        location: '1 этаж, 5 очередь',
        status: 'offline',
        template: 'Утренние новости',
      },
      {
        id: '#TV-006',
        name: 'Hall - section 6',
        location: '1 этаж, 6 очередь',
        status: 'online',
        template: 'Погода',
      },
    ],
    lift: [
      {
        id: '#LF-001',
        name: 'Lift - подъезд 1',
        location: 'Подъезд 1',
        status: 'online',
        template: 'Короткие объявления',
      },
      {
        id: '#LF-002',
        name: 'Lift - подъезд 2',
        location: 'Подъезд 2',
        status: 'pending',
        template: 'Реклама партнеров',
      },
      {
        id: '#LF-003',
        name: 'Lift - подъезд 3',
        location: 'Подъезд 3',
        status: 'emergency',
        template: 'Режим ЧС',
      },
      {
        id: '#LF-004',
        name: 'Lift - подъезд 4',
        location: 'Подъезд 4',
        status: 'offline',
        template: 'Короткие объявления',
      },
    ],
    parking: [
      {
        id: '#PK-001',
        name: 'Parking - въезд',
        location: 'Минус первый этаж',
        status: 'online',
        template: 'Свободные места',
      },
      {
        id: '#PK-002',
        name: 'Parking - гостевая',
        location: 'Гостевая парковка',
        status: 'pending',
        template: 'Правила парковки',
      },
      {
        id: '#PK-003',
        name: 'Parking - выезд',
        location: 'Выезд',
        status: 'online',
        template: 'Погода',
      },
    ],
  },
  2: {
    hall: [
      {
        id: '#SV-001',
        name: 'Hall - reception',
        location: 'Ресепшн',
        status: 'online',
        template: 'Новости УК',
      },
      {
        id: '#SV-002',
        name: 'Hall - entrance',
        location: 'Главный вход',
        status: 'pending',
        template: 'Правила ЖК',
      },
    ],
    lift: [
      {
        id: '#SV-LF-001',
        name: 'Lift - section 1',
        location: 'Подъезд 1',
        status: 'offline',
        template: 'Объявления',
      },
      {
        id: '#SV-LF-002',
        name: 'Lift - section 2',
        location: 'Подъезд 2',
        status: 'emergency',
        template: 'Режим ЧС',
      },
    ],
    parking: [
      {
        id: '#SV-PK-001',
        name: 'Parking - main',
        location: 'Паркинг',
        status: 'online',
        template: 'Свободные места',
      },
    ],
  },
  3: {
    hall: [
      {
        id: '#PR-001',
        name: 'Hall - main',
        location: 'Главный холл',
        status: 'online',
        template: 'Новости УК',
      },
      {
        id: '#PR-002',
        name: 'Hall - side',
        location: 'Боковой вход',
        status: 'pending',
        template: 'Контакты',
      },
    ],
    parking: [
      {
        id: '#PR-PK-001',
        name: 'Parking - гостевая',
        location: 'Гостевая парковка',
        status: 'online',
        template: 'Правила парковки',
      },
    ],
  },
  4: {
    hall: [
      {
        id: '#YS-001',
        name: 'Hall - section 1',
        location: 'Первый этаж',
        status: 'online',
        template: 'Новости УК',
      },
    ],
    lift: [
      {
        id: '#YS-LF-001',
        name: 'Lift - section 3',
        location: 'Подъезд 3',
        status: 'online',
        template: 'Короткие объявления',
      },
    ],
    parking: [
      {
        id: '#YS-PK-001',
        name: 'Parking - guest',
        location: 'Гостевая парковка',
        status: 'pending',
        template: 'Правила парковки',
      },
    ],
  },
  5: {
    hall: [
      {
        id: '#VS-HL-001',
        name: 'Hall - reception',
        location: 'Главная стойка',
        status: 'online',
        template: 'Правила ЖК',
      },
    ],
    lift: [
      {
        id: '#VS-LF-001',
        name: 'Lift - east',
        location: 'Все лифты',
        status: 'emergency',
        template: 'Режим ЧС',
      },
    ],
    parking: [
      {
        id: '#VS-PK-001',
        name: 'Parking - tower',
        location: 'Подземный паркинг',
        status: 'offline',
        template: 'Свободные места',
      },
    ],
  },
}

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
        id: 'hall',
        label: 'Холл',
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
        id: 'parking',
        label: 'Парковка',
        icon: Car,
        status: 'draft',
        audience: 'Подземный паркинг',
        widgets: ['Свободные места', 'Правила парковки'],
      },
    ],
  },
]

function App() {
  const [selectedHouseId, setSelectedHouseId] = useState(houses[0].id)
  const [selectedDisplayId, setSelectedDisplayId] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [view, setView] = useState('home')
  const [authMode, setAuthMode] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true' || Boolean(localStorage.getItem('accessToken')),
  )
  const [currentUserName, setCurrentUserName] = useState(
    () => localStorage.getItem('currentUserName') || 'Admin',
  )
  const [deviceSearch, setDeviceSearch] = useState('')
  const [managedDeviceId, setManagedDeviceId] = useState(null)
  const [screenCode, setScreenCode] = useState('')
  const [screenCodeMessage, setScreenCodeMessage] = useState('')
  const [templateWidgets, setTemplateWidgets] = useState([])
  const [widgetTitle, setWidgetTitle] = useState('')
  const [widgetSize, setWidgetSize] = useState(3)
  const [widgetHeight, setWidgetHeight] = useState(4)
  const [widgetUrl, setWidgetUrl] = useState('')
  const [templateSaveMessage, setTemplateSaveMessage] = useState('')
  const [templatePublicUrl, setTemplatePublicUrl] = useState('')
  const [selectedTemplateWidgetId, setSelectedTemplateWidgetId] = useState(null)
  const templateCanvasRef = useRef(null)
  const [templateCanvasWidth, setTemplateCanvasWidth] = useState(0)
  const [emergencyHouseId, setEmergencyHouseId] = useState(houses[1].id)
  const [emergencyScope, setEmergencyScope] = useState('all')
  const [emergencyGroupId, setEmergencyGroupId] = useState('hall')
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [emergencyDisplayIds, setEmergencyDisplayIds] = useState([])
  const [emergencyLog, setEmergencyLog] = useState([
    {
      id: 1,
      date: '12.10.2023 14:32',
      initiator: 'Иванов А.С.',
      target: 'ЖК «Панорама» (Все экраны)',
      message: 'Внимание! Плановая проверка системы оповещения. Просьба сохранять спокойствие.',
      status: 'deactivated',
    },
    {
      id: 2,
      date: '12.10.2023 10:15',
      initiator: 'Системный админ',
      target: 'Все объекты',
      message: 'ВНИМАНИЕ! Пожарная тревога в корпусе 2. Срочно покиньте здание!',
      status: 'active',
    },
    {
      id: 3,
      date: '11.10.2023 18:45',
      initiator: 'Петров Д.М.',
      target: 'ЖК «Лазурный» (Лифт №3)',
      message: 'Проводятся технические работы. Приносим извинения за неудобства.',
      status: 'deactivated',
    },
  ])

  const visibleHouses = useMemo(
    () => Array.from({ length: 4 }, (_, index) => houses[(carouselIndex + index) % houses.length]),
    [carouselIndex],
  )

  const selectedHouse = useMemo(
    () => houses.find((house) => house.id === selectedHouseId) || houses[0],
    [selectedHouseId],
  )

  const selectedDisplay = selectedHouse.displays.find((display) => display.id === selectedDisplayId)
  const selectedDevices = selectedDisplay
    ? screenDevices[selectedHouse.id]?.[selectedDisplay.id] || []
    : []
  const filteredDevices = selectedDevices.filter((device) =>
    device.id.toLowerCase().includes(deviceSearch.trim().toLowerCase()),
  )
  const emergencyHouse = houses.find((house) => house.id === Number(emergencyHouseId)) || houses[0]
  const emergencyDevices = Object.values(screenDevices[emergencyHouse.id] || {}).flat()
  const selectedEmergencyDevices = emergencyDevices.filter((device) =>
    emergencyDisplayIds.includes(device.id),
  )

  const emergencyGroups = [
    { id: 'hall', label: 'Холлы' },
    { id: 'lift', label: 'Лифты' },
    { id: 'parking', label: 'Парковки' },
  ]
  const selectedEmergencyGroup = emergencyGroups.find((group) => group.id === emergencyGroupId)
  const selectedEmergencyGroupDevices = screenDevices[emergencyHouse.id]?.[emergencyGroupId] || []
  const selectedTemplateWidget = templateWidgets.find(
    (widget) => widget.id === selectedTemplateWidgetId,
  )
  const isTemplateCanvasMounted = templateCanvasWidth > 0
  const templateColumnWidth =
    templateCanvasWidth > 0
      ? (templateCanvasWidth - TEMPLATE_PADDING * 2 - TEMPLATE_GAP * (TEMPLATE_COLUMNS - 1)) /
        TEMPLATE_COLUMNS
      : 0
  const templateColumnStep = templateColumnWidth + TEMPLATE_GAP
  const templateRowStep = TEMPLATE_ROW_HEIGHT + TEMPLATE_GAP
  const templateCanvasHeight = Math.max(
    760,
    ...templateWidgets.map(
      (widget) => TEMPLATE_PADDING + widget.y * templateRowStep + widget.h * TEMPLATE_ROW_HEIGHT + (widget.h - 1) * TEMPLATE_GAP + TEMPLATE_PADDING,
    ),
  )

  useEffect(() => {
    if (view !== 'templates' || !templateCanvasRef.current) {
      return undefined
    }

    const canvasElement = templateCanvasRef.current
    const updateCanvasWidth = () => {
      setTemplateCanvasWidth(canvasElement.clientWidth)
    }

    updateCanvasWidth()

    const resizeObserver = new ResizeObserver(updateCanvasWidth)
    resizeObserver.observe(canvasElement)

    return () => resizeObserver.disconnect()
  }, [view])

  function selectHouse(house) {
    setSelectedHouseId(house.id)
    setSelectedDisplayId(null)
    setDeviceSearch('')
    setManagedDeviceId(null)
    setScreenCode('')
    setScreenCodeMessage('')
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
      let authResponse

      if (authMode === 'register') {
        authResponse = await register(payload)
      } else {
        authResponse = await login(payload)
      }

      const token = authResponse?.token || authResponse?.access_token || authResponse?.accessToken

      if (token) {
        localStorage.setItem('accessToken', token)
      }
    } catch {
      // no-op
    }

    const userName = nextName || 'Admin'

    localStorage.setItem('currentUserName', userName)
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
    setCurrentUserName(userName)
  }

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // no-op
    }

    setIsAuthenticated(false)
    setAuthMode('login')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUserName')
  }

  async function handleSendTemplate() {
    try {
      await assignTemplate({
        houseId: selectedHouse.id,
        displayIds: selectedHouse.displays.map((display) => display.id),
        templateId: 'default-dashboard',
      })
    } catch {
      // no-op
    }
  }

  async function handleCreateScreenCode() {
    setScreenCodeMessage('Запрашиваем код подключения...')

    try {
      const response = await createScreenCode({ building_id: selectedHouse.id })
      const code = response?.code || response?.screen_code || response?.data?.code || response

      setScreenCode(String(code))
      setScreenCodeMessage('Введите этот код на новом экране.')
    } catch {
      const fallbackCode = String(Math.floor(100000 + Math.random() * 900000))

      setScreenCode(fallbackCode)
      setScreenCodeMessage('Код подключения создан.')
    }
  }

  async function handleCheckNewScreen() {
    if (!screenCode) {
      return
    }

    try {
      await getNewScreen(screenCode)
      setScreenCodeMessage('Новый экран найден, можно обновить список устройств.')
    } catch {
      setScreenCodeMessage('Экран с этим кодом не найден.')
    }
  }

  async function handleActivateEmergency() {
    const groupDisplayLabel = selectedEmergencyGroupDevices.map((device) => device.id).join(', ')

    const selectedDisplayLabel = selectedEmergencyDevices.map((device) => device.id).join(', ')

    const targetLabel =
      emergencyScope === 'all'
        ? `${emergencyHouse.title} (Все экраны)`
        : emergencyScope === 'group'
          ? `${emergencyHouse.title} (${selectedEmergencyGroup?.label || 'Группа'}: ${groupDisplayLabel || 'нет дисплеев'})`
          : `${emergencyHouse.title} (${selectedDisplayLabel || 'Дисплеи не выбраны'})`

    try {
      await activateEmergency({
        building_id: Number(emergencyHouseId),
        scope: emergencyScope,
        group_id: emergencyScope === 'group' ? emergencyGroupId : null,
        display_ids: emergencyScope === 'selected' ? emergencyDisplayIds : [],
        message: emergencyMessage,
      })
    } catch {
      // no-op
    }

    setEmergencyLog((currentLog) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        initiator: currentUserName,
        target: targetLabel,
        message: emergencyMessage || 'Экстренное оповещение',
        status: 'active',
      },
      ...currentLog,
    ])
  }

  async function handleResetEmergency(logId) {
    try {
      await resetEmergency({
        building_id: Number(emergencyHouseId),
        log_id: logId,
      })
    } catch {
      // no-op
    }

    setEmergencyLog((currentLog) =>
      currentLog.map((item) =>
        item.id === logId ? { ...item, status: 'deactivated' } : item,
      ),
    )
  }

  function handleAddWidget() {
    const size = Number(widgetSize)
    const height = Number(widgetHeight)
    const id = `widget-${Date.now()}`
    const normalizedUrl = normalizeWidgetUrl(widgetUrl)

    setTemplateWidgets((currentWidgets) => [
      ...currentWidgets,
      {
        id,
        title: widgetTitle || 'Новый виджет',
        url: normalizedUrl,
        x: 0,
        y: Infinity,
        w: size,
        h: height,
      },
    ])

    setSelectedTemplateWidgetId(id)
    setWidgetTitle('')
    setWidgetSize(3)
    setWidgetHeight(4)
    setWidgetUrl('')
  }

  function updateTemplateWidget(field, value) {
    setTemplateWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === selectedTemplateWidgetId ? { ...widget, [field]: value } : widget,
      ),
    )
  }

  function removeTemplateWidget() {
    setTemplateWidgets((currentWidgets) =>
      currentWidgets.filter((widget) => widget.id !== selectedTemplateWidgetId),
    )
    setSelectedTemplateWidgetId(null)
  }

  function clampTemplateValue(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function getTemplateWidgetStyle(widget) {
    return {
      height: widget.h * TEMPLATE_ROW_HEIGHT + (widget.h - 1) * TEMPLATE_GAP,
      left: TEMPLATE_PADDING + widget.x * templateColumnStep,
      top: TEMPLATE_PADDING + widget.y * templateRowStep,
      width: widget.w * templateColumnWidth + (widget.w - 1) * TEMPLATE_GAP,
    }
  }

  function startTemplateWidgetResize(event, widgetId, direction) {
  if (!templateCanvasWidth) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.currentTarget.setPointerCapture(event.pointerId)
  setSelectedTemplateWidgetId(widgetId)

  const widget = templateWidgets.find((currentWidget) => currentWidget.id === widgetId)

  if (!widget) {
    return
  }

  const startClientX = event.clientX
  const startClientY = event.clientY
  const startX = widget.x
  const startY = widget.y
  const startWidth = widget.w
  const startHeight = widget.h

  function handlePointerMove(pointerEvent) {
    pointerEvent.preventDefault()

    const widthDelta = Math.round((pointerEvent.clientX - startClientX) / templateColumnStep)
    const heightDelta = Math.round((pointerEvent.clientY - startClientY) / templateRowStep)

    setTemplateWidgets((currentWidgets) =>
      currentWidgets.map((currentWidget) => {
        if (currentWidget.id !== widgetId) {
          return currentWidget
        }

        let nextX = startX
        let nextY = startY
        let nextWidth = startWidth
        let nextHeight = startHeight

        if (direction.includes('e')) {
          nextWidth = clampTemplateValue(startWidth + widthDelta, 1, TEMPLATE_COLUMNS - startX)
        }

        if (direction.includes('w')) {
          nextX = clampTemplateValue(startX + widthDelta, 0, startX + startWidth - 1)
          nextWidth = startWidth + startX - nextX
        }

        if (direction.includes('s')) {
          nextHeight = clampTemplateValue(startHeight + heightDelta, 1, 20)
        }

        if (direction.includes('n')) {
          nextY = Math.max(0, startY + heightDelta)
          nextHeight = Math.max(1, startHeight + startY - nextY)
        }

        return {
          ...currentWidget,
          x: nextX,
          y: nextY,
          w: nextWidth,
          h: nextHeight,
        }
      }),
    )
  }

  function handlePointerUp() {
    event.currentTarget.releasePointerCapture(event.pointerId)
    event.currentTarget.removeEventListener('pointermove', handlePointerMove)
    event.currentTarget.removeEventListener('pointerup', handlePointerUp)
  }

  event.currentTarget.addEventListener('pointermove', handlePointerMove)
  event.currentTarget.addEventListener('pointerup', handlePointerUp)
}

  function updateTemplateWidgetNumber(field, value) {
    const limits = {
      w: { min: 3, max: 12 },
      h: { min: 2, max: 12 },
    }
    const nextValue = Number(value)
    const limit = limits[field]

    if (!Number.isFinite(nextValue)) {
      return
    }

    updateTemplateWidget(field, Math.min(limit.max, Math.max(limit.min, nextValue)))
  }

  function normalizeWidgetUrl(value) {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return ''
    }

    if (/^https?:\/\//i.test(trimmedValue)) {
      return trimmedValue
    }

    return `https://${trimmedValue}`
  }

  async function handleSaveTemplate() {
  const payload = {
    building_id: selectedHouse.id,
    name: 'Шаблон для ТВ',
    grid: {
      columns: TEMPLATE_COLUMNS,
      row_height: TEMPLATE_ROW_HEIGHT,
      gap: TEMPLATE_GAP,
      padding: TEMPLATE_PADDING,
    },
    widgets: templateWidgets.map((widget) => ({
      id: widget.id,
      title: widget.title,
      url: normalizeWidgetUrl(widget.url),
      x: widget.x,
      y: widget.y,
      width: widget.w,
      height: widget.h,
    })),
  }

  try {
    const response = await saveTemplate(payload)
    const publicUrl =
      response?.url || response?.link || response?.public_url || response?.data?.url || ''

    setTemplatePublicUrl(publicUrl)
    setTemplateSaveMessage('Шаблон сохранен')
  } catch {
    setTemplatePublicUrl('')
    setTemplateSaveMessage('Не удалось сохранить шаблон')
  }
}

  function formatScreenCount(count) {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} экран`
    }

    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return `${count} экрана`
    }

    return `${count} экранов`
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
        <button
          className="logo"
          type="button"
          aria-label="Главная"
          onClick={() => setView('home')}
        >
          <img className="logo-image" src="/logo.png" alt="Логотип УК" />
        </button>

        <nav className="menu">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                aria-label={item.label}
                className={view === item.view ? 'menu-button is-active' : 'menu-button'}
                key={item.id}
                title={item.label}
                type="button"
                onClick={() => setView(item.view)}
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

        <main
          className={
            view === 'home'
              ? 'content home-page'
              : view === 'templates'
                ? 'content templates-page'
                : view === 'emergency'
                  ? 'content emergency-page'
                  : 'content address-page'
          }
        >
          {view === 'home' ? (
            <>
              <section className="content-heading">
                <div>
                  <h2>Подключенные дома</h2>
                  <p>Адреса, группы экранов и шаблоны для дисплеев ЖК</p>
                </div>
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
          ) : view === 'templates' ? (
            <section className="templates-page-inner">
              <section className="template-builder-card">
                <div className="template-builder-heading">
                  <div>
                    <span className="section-kicker">Шаблоны</span>
                    <h2>Конструктор шаблонов</h2>
                    <p>Создавайте виджеты, двигайте их мышкой и настраивайте содержимое.</p>
                  </div>

                  <button className="send-template-button" type="button" onClick={handleSaveTemplate}>
                    Сохранить шаблон
                  </button>
                  {templateSaveMessage && (
                    <div className="template-save-message">
                      <span>{templateSaveMessage}</span>
                                    
                      {templatePublicUrl && (
                        <a href={templatePublicUrl} target="_blank" rel="noreferrer">
                          Открыть шаблон
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="template-builder-form">
                  <label>
                    <span>Название виджета</span>
                    <input
                      value={widgetTitle}
                      onChange={(event) => setWidgetTitle(event.target.value)}
                      placeholder="Например: Новости УК"
                    />
                  </label>

                  <label>
                    <span>Размер</span>
                    <select
                      value={widgetSize}
                      onChange={(event) => setWidgetSize(event.target.value)}
                    >
                      <option value={3}>3 колонки</option>
                      <option value={4}>4 колонки</option>
                      <option value={6}>6 колонок</option>
                    </select>
                  </label>

                  <label>
                    <span>Высота</span>
                    <select
                      value={widgetHeight}
                      onChange={(event) => setWidgetHeight(event.target.value)}
                    >
                      <option value={3}>3 строки</option>
                      <option value={4}>4 строки</option>
                      <option value={6}>6 строк</option>
                    </select>
                  </label>

                  <label>
                    <span>Сайт виджета</span>
                    <input
                      value={widgetUrl}
                      onChange={(event) => setWidgetUrl(event.target.value)}
                      placeholder="https://example.com"
                    />
                  </label>

                  <button className="connect-screen-button" type="button" onClick={handleAddWidget}>
                    <span>+</span>
                    Добавить виджет
                  </button>
                </div>
              </section>

              <section className="template-editor-layout">
                <div className="template-screen">
                  <div className="template-screen-header">
                    <span>Полотно шаблона</span>
                    <strong>12 колонок</strong>
                  </div>

                  <div className="template-canvas-shell" ref={templateCanvasRef}>
                    {isTemplateCanvasMounted && (
                      <div
                        className="template-canvas"
                        style={{ height: templateCanvasHeight }}
                      >
                        {templateWidgets.map((widget) => {
                          const widgetFrameUrl = normalizeWidgetUrl(widget.url)

                          return (
                            <article
                              className={
                                selectedTemplateWidgetId === widget.id
                                  ? 'template-widget is-selected'
                                  : 'template-widget'
                              }
                              key={widget.id}
                              style={getTemplateWidgetStyle(widget)}
                              onClick={() => setSelectedTemplateWidgetId(widget.id)}
                            >
                              <div className="template-widget-handle">
                                <strong>{widget.title}</strong>
                                <span>
                                  {widget.w} x {widget.h}
                                </span>
                              </div>

                              <div className="template-widget-preview">
                                {widgetFrameUrl ? (
                                  <>
                                    <iframe
                                      src={widgetFrameUrl}
                                      title={widget.title}
                                      loading="lazy"
                                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    />
                                    <a
                                      className="template-widget-open-link"
                                      href={widgetFrameUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Открыть сайт
                                    </a>
                                  </>
                                ) : (
                                  <p>Укажите ссылку сайта в настройках виджета.</p>
                                )}
                              </div>

                              <span
                                className="template-widget-resize-handle is-east"
                                onPointerDown={(event) =>
                                  startTemplateWidgetResize(event, widget.id, 'e')
                                }
                              />
                              <span
                                className="template-widget-resize-handle is-north"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'n')}
                              />
                              <span
                                className="template-widget-resize-handle is-south"
                                onPointerDown={(event) =>
                                  startTemplateWidgetResize(event, widget.id, 's')
                                }
                              />
                              <span
                                className="template-widget-resize-handle is-corner"
                                onPointerDown={(event) =>
                                  startTemplateWidgetResize(event, widget.id, 'se')
                                }
                              />
                              <span
                                className="template-widget-resize-handle is-west"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'w')}
                              />
                              <span
                                className="template-widget-resize-handle is-north"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'n')}
                              />
                              <span
                                className="template-widget-resize-handle is-north-east"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'ne')}
                              />
                              <span
                                className="template-widget-resize-handle is-north-west"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'nw')}
                              />
                              <span
                                className="template-widget-resize-handle is-south-west"
                                onPointerDown={(event) => startTemplateWidgetResize(event, widget.id, 'sw')}
                              />
                            </article>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <aside className="template-inspector">
                  <h3>Настройка виджета</h3>

                  {selectedTemplateWidget ? (
                    <div className="template-inspector-fields">
                      <label>
                        <span>Название</span>
                        <input
                          value={selectedTemplateWidget.title}
                          onChange={(event) => updateTemplateWidget('title', event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Сайт внутри виджета</span>
                        <input
                          value={selectedTemplateWidget.url}
                          onBlur={(event) =>
                            updateTemplateWidget('url', normalizeWidgetUrl(event.target.value))
                          }
                          onChange={(event) => updateTemplateWidget('url', event.target.value)}
                          placeholder="https://example.com"
                        />
                      </label>

                      {normalizeWidgetUrl(selectedTemplateWidget.url) && (
                        <a
                          className="template-open-site-button"
                          href={normalizeWidgetUrl(selectedTemplateWidget.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Открыть сайт
                        </a>
                      )}

                      <div className="template-size-fields">
                        <label>
                          <span>Ширина, колонки</span>
                          <input
                            min="3"
                            max="12"
                            type="number"
                            value={selectedTemplateWidget.w}
                            onChange={(event) => updateTemplateWidgetNumber('w', event.target.value)}
                          />
                        </label>

                        <label>
                          <span>Высота, строки</span>
                          <input
                            min="2"
                            max="12"
                            type="number"
                            value={selectedTemplateWidget.h}
                            onChange={(event) => updateTemplateWidgetNumber('h', event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        className="template-remove-button"
                        type="button"
                        onClick={removeTemplateWidget}
                      >
                        Удалить виджет
                      </button>
                    </div>
                  ) : (
                    <p>Выберите виджет на экране, чтобы настроить его текст.</p>
                  )}
                </aside>
              </section>
            </section>
          ) : view === 'emergency' ? (
            <section className="emergency-page-inner">
              <section className="emergency-card">
                <div className="emergency-heading">
                  <h2>Управление режимом ЧС</h2>
                  <p>Централизованное управление экстренными оповещениями по объектам</p>
                </div>

                <h3>Новое оповещение</h3>

                <div className="emergency-form-grid">
                  <div className="emergency-left-column">
                    <label className="emergency-field">
                      <span>Адрес ЖК</span>
                      <select
                        value={emergencyHouseId}
                        onChange={(event) => {
                          setEmergencyHouseId(event.target.value)
                          setEmergencyGroupId('hall')
                          setEmergencyDisplayIds([])
                        }}
                      >
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            {house.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="emergency-field">
                      <span>Область вещания</span>
                      <div className="emergency-scope-tabs">
                        <button
                          className={emergencyScope === 'all' ? 'is-active' : ''}
                          type="button"
                          onClick={() => setEmergencyScope('all')}
                        >
                          Все экраны
                        </button>
                        <button
                          className={emergencyScope === 'group' ? 'is-active' : ''}
                          type="button"
                          onClick={() => setEmergencyScope('group')}
                        >
                          Группа
                        </button>
                        <button
                          className={emergencyScope === 'selected' ? 'is-active' : ''}
                          type="button"
                          onClick={() => setEmergencyScope('selected')}
                        >
                          Выборочно
                        </button>
                      </div>
                      {emergencyScope === 'group' && (
                        <div className="emergency-group-picker">
                          {emergencyGroups.map((group) => (
                            <button
                              className={emergencyGroupId === group.id ? 'is-active' : ''}
                              key={group.id}
                              type="button"
                              onClick={() => setEmergencyGroupId(group.id)}
                            >
                              {group.label}
                            </button>
                          ))}
                        </div>
                        )}                        
                      {emergencyScope === 'selected' && (
                        <div className="emergency-display-picker">
                          {emergencyDevices.map((device) => (
                            <label key={device.id}>
                              <input
                                type="checkbox"
                                checked={emergencyDisplayIds.includes(device.id)}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setEmergencyDisplayIds((currentIds) => [...currentIds, device.id])
                                  } else {
                                    setEmergencyDisplayIds((currentIds) =>
                                      currentIds.filter((id) => id !== device.id),
                                    )
                                  }
                                }}
                              />
                              <span>{device.name}</span>
                              <strong>{device.id}</strong>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="emergency-actions">
                      <button
                        className="emergency-activate"
                        type="button"
                        onClick={handleActivateEmergency}
                      >
                        <TriangleAlert size={17} />
                        Активировать режим ЧС
                      </button>
                    </div>
                  </div>

                  <label className="emergency-field emergency-message-field">
                    <span>Текст сообщения</span>
                    <textarea
                      value={emergencyMessage}
                      onChange={(event) => setEmergencyMessage(event.target.value)}
                      placeholder="Введите текст экстренного сообщения"
                    />
                  </label>
                </div>
              </section>

              <section className="emergency-card">
                <h2>Журнал действий</h2>

                <div className="emergency-log-table-wrap">
                  <table className="emergency-log-table">
                    <thead>
                      <tr>
                        <th>Дата и время</th>
                        <th>Инициатор</th>
                        <th>Объект / дисплей</th>
                        <th>Текст сообщения</th>
                        <th>Статус</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {emergencyLog.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.initiator}</td>
                          <td>{item.target}</td>
                          <td>{item.message}</td>
                          <td>
                            <span className={`emergency-log-status ${item.status}`}>
                              {item.status === 'active' ? 'Активно' : 'Деактивировано'}
                            </span>
                          </td>
                          <td>
                            {item.status === 'active' ? (
                              <button
                                className="emergency-log-reset"
                                type="button"
                                onClick={() => handleResetEmergency(item.id)}
                              >
                                Сброс
                              </button>
                            ) : (
                              <span className="emergency-log-empty">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
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

                <button className="connect-screen-button" type="button" onClick={handleCreateScreenCode}>
                  <span>+</span>
                  Подключить экран
                </button>
              </div>

              {screenCode && (
                <div className="screen-code-panel" aria-live="polite">
                  <div>
                    <span>Код подключения</span>
                    <strong>{screenCode}</strong>
                    <p>{screenCodeMessage}</p>
                  </div>

                  <button type="button" onClick={handleCheckNewScreen}>
                    Проверить экран
                  </button>
                </div>
              )}

              <div className="screen-groups-grid" aria-label="Группы устройств">
                {selectedHouse.displays.map((display) => {
                  const DisplayIcon = display.icon
                  const devicesCount = screenDevices[selectedHouse.id]?.[display.id]?.length || 0

                  return (
                    <button
                      className={
                        selectedDisplayId === display.id
                          ? 'screen-group-card is-active'
                          : 'screen-group-card'
                      }
                      key={display.id}
                      type="button"
                      onClick={() => {
                        setSelectedDisplayId(display.id)
                        setDeviceSearch('')
                        setManagedDeviceId(null)
                      }}
                    >
                      <div className="screen-group-title">
                        <DisplayIcon size={24} />
                        <h3>{groupTitles[display.id] || display.label}</h3>
                      </div>

                      <span>{formatScreenCount(devicesCount)}</span>
                    </button>
                  )
                })}
              </div>

              <section className="devices-panel" aria-label="Список устройств">
                <div className="devices-panel-header">
                  <div>
                    <h3>Список устройств</h3>
                    {selectedDisplay && (
                      <p>{groupTitles[selectedDisplay.id] || selectedDisplay.label}</p>
                    )}
                  </div>

                  {selectedDisplay && (
                    <label className="device-search">
                      <Search size={16} />
                      <input
                        value={deviceSearch}
                        onChange={(event) => setDeviceSearch(event.target.value)}
                        placeholder="Поиск по ID устройства"
                      />
                    </label>
                  )}
                </div>

                {!selectedDisplay ? (
                  <div className="devices-empty">
                    Выберите группу устройств: холлы, лифты или парковки.
                  </div>
                ) : filteredDevices.length === 0 ? (
                  <div className="devices-empty">Устройство с таким ID не найдено.</div>
                ) : (
                  <div className="devices-table-wrap">
                    <table className="devices-table">
                      <thead>
                        <tr>
                          <th>Название</th>
                          <th>ID устройства</th>
                          <th>Локация</th>
                          <th>Статус</th>
                          <th>Активный шаблон</th>
                          <th>Действия</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredDevices.map((device) => (
                          <tr key={device.id}>
                            <td>{device.name}</td>
                            <td>{device.id}</td>
                            <td>{device.location}</td>
                            <td>
                              <span
                                className={`device-status ${device.status}`}
                                title={statusMeta[device.status].description}
                              >
                                {statusMeta[device.status].label}
                              </span>
                            </td>
                            <td>{device.template}</td>
                            <td className="device-actions-cell">
                              <button
                                className="manage-device-button"
                                type="button"
                                onClick={() =>
                                  setManagedDeviceId(
                                    managedDeviceId === device.id ? null : device.id,
                                  )
                                }
                              >
                                Управлять
                              </button>

                              {managedDeviceId === device.id && (
                                <div className="manage-device-menu">
                                  <button type="button">Изменить характеристики</button>
                                  <button type="button" onClick={handleSendTemplate}>
                                    Менять шаблоны
                                  </button>
                                  <button className="danger" type="button">
                                    Удалить устройство
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
