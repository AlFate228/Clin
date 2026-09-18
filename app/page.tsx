'use client';

import { useEffect, useMemo, useState } from 'react';

const SERVICES = [
  {
    id: 'sedan',
    name: 'Полная химчистка — седан',
    price: 'от 10 000 ₽',
  },
  {
    id: 'crossover',
    name: 'Полная химчистка — кроссовер',
    price: 'от 15 000 ₽',
  },
  {
    id: 'suv',
    name: 'Полная химчистка — внедорожник',
    price: '18 000–20 000 ₽',
  },
  {
    id: 'ceiling',
    name: 'Химчистка потолка',
    price: '2 500 ₽',
  },
  {
    id: 'seats',
    name: 'Химчистка сидений',
    price: '3 000 ₽',
  },
  {
    id: 'carpet',
    name: 'Химчистка ковра',
    price: '3 000 ₽',
  },
  {
    id: 'plastic',
    name: 'Чистка всего пластика (седан)',
    price: '1 500 ₽',
  },
  {
    id: 'carpet-remove',
    name: 'Снятие ковролина',
    price: 'от 2 000 до 5 000 ₽',
  },
];

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function key(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;
}

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [booked, setBooked] = useState<string[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [date, setDate] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    carMake: '',
    plate: '',
    time: '',
    extra: '',
  });

  // Загружаем занятые даты
  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoadingCalendar(true);

        const response = await fetch('/api/calendar', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Calendar request failed');
        }

        const data = await response.json();

        setBlocked(Array.isArray(data.blocked) ? data.blocked : []);
        setBooked(Array.isArray(data.booked) ? data.booked : []);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить календарь.');
      } finally {
        setLoadingCalendar(false);
      }
    }

    loadCalendar();
  }, []);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();

    const result: (Date | null)[] = [];

    for (let i = 0; i < offset; i++) {
      result.push(null);
    }

    for (let d = 1; d <= count; d++) {
      result.push(new Date(year, month, d));
    }

    return result;
  }, [cursor]);

  const isBusy = (dateKey: string) => {
    return blocked.includes(dateKey) || booked.includes(dateKey);
  };

  function add(service: any) {
    if (!cart.some((item) => item.id === service.id)) {
      setCart((current) => [...current, service]);
    }
  }

  function remove(id: string) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  async function submit(e: any) {
    e.preventDefault();

    setError('');
    setSent(false);

    if (!date) {
      setError('Выберите свободную дату в календаре.');
      return;
    }

    if (!cart.length) {
      setError('Добавьте хотя бы одну услугу.');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          date,
          services: cart,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Ошибка при отправке заявки.'
        );
        return;
      }

      setSent(true);

      setCart([]);

      setForm({
        name: '',
        phone: '',
        carMake: '',
        plate: '',
        time: '',
        extra: '',
      });

      setDate('');
    } catch (err) {
      console.error(err);

      setError(
        'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.'
      );
    }
  }

  return (
    <>
      <header>
        <div className="container nav">
          <a className="brand" href="#top">
            <img
              src="/logo.png"
              onError={(e: any) => {
                e.currentTarget.src =
                  '/logo-placeholder.svg';
              }}
              alt="Логотип"
            />
          </a>

          <nav>
            <a href="#services">Услуги</a>
            <a href="#calendar">Свободные даты</a>
            <a href="#booking">Записаться</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="container hero">
          <div>
            <div className="eyebrow">
              Каспийск · химчистка автомобилей
            </div>

            <h1>
              Чистый салон.
              <br />
              Другие ощущения.
            </h1>

            <p>
              Глубокая химчистка салона автомобиля с
              вниманием к деталям. Выберите услуги,
              свободную дату и отправьте заявку —
              мойщики сразу увидят её в Telegram.
            </p>

            <div className="actions">
              <a
                className="btn primary"
                href="#booking"
              >
                Записаться на химчистку
              </a>

              <a
                className="btn secondary"
                href="#services"
              >
                Посмотреть услуги
              </a>
            </div>
          </div>

          <div className="hero-card">
            <h3>Как проходит запись</h3>

            <div className="trust">
              <div>
                <span className="dot" />
                <span>
                  Выбираете нужные услуги и дату.
                </span>
              </div>

              <div>
                <span className="dot" />
                <span>
                  Оставляете контакты и данные автомобиля.
                </span>
              </div>

              <div>
                <span className="dot" />
                <span>
                  Заявка сразу приходит в Telegram
                  мойщикам.
                </span>
              </div>

              <div>
                <span className="dot" />
                <span>
                  Финальная стоимость подтверждается после
                  оценки состояния авто.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section" id="services">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Услуги</h2>

                <p>
                  Добавляйте несколько позиций в одну
                  заявку — например, полную химчистку и
                  снятие ковролина.
                </p>
              </div>
            </div>

            <div className="services">
              {SERVICES.map((service) => (
                <article
                  className="service"
                  key={service.id}
                >
                  <h3>{service.name}</h3>

                  <p>
                    {service.id === 'sedan' ||
                    service.id === 'crossover' ||
                    service.id === 'suv'
                      ? 'Полная обработка салона. Точная цена зависит от размера и состояния автомобиля.'
                      : 'Отдельная услуга для локальной очистки и ухода за салоном.'}
                  </p>

                  <div className="price">
                    {service.price}
                  </div>

                  <button
                    className="btn secondary"
                    style={{ marginTop: 14 }}
                    onClick={() => add(service)}
                  >
                    {cart.some(
                      (item) => item.id === service.id
                    )
                      ? 'Добавлено'
                      : 'Добавить в заявку'}
                  </button>
                </article>
              ))}
            </div>

            <div className="note">
              <b>Важно:</b> указанные цены являются
              ориентировочными. Итоговая стоимость может
              быть увеличена в зависимости от степени
              загрязнения, состояния салона, сложности
              работ и необходимости дополнительных
              процедур.
            </div>
          </div>
        </section>

        {/* CALENDAR */}
        <section className="section" id="calendar">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Выберите дату</h2>

                <p>
                  Голубая отметка — дата доступна для
                  записи. Красная — день занят.
                </p>
              </div>
            </div>

            <div className="calendar-wrap">
              <div className="calendar">
                <div className="cal-head">
                  <button
                    type="button"
                    onClick={() =>
                      setCursor(
                        new Date(
                          cursor.getFullYear(),
                          cursor.getMonth() - 1,
                          1
                        )
                      )
                    }
                  >
                    ‹
                  </button>

                  <b>
                    {monthNames[cursor.getMonth()]}{' '}
                    {cursor.getFullYear()}
                  </b>

                  <button
                    type="button"
                    onClick={() =>
                      setCursor(
                        new Date(
                          cursor.getFullYear(),
                          cursor.getMonth() + 1,
                          1
                        )
                      )
                    }
                  >
                    ›
                  </button>
                </div>

                <div className="dow">
                  {[
                    'Пн',
                    'Вт',
                    'Ср',
                    'Чт',
                    'Пт',
                    'Сб',
                    'Вс',
                  ].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="days">
                  {days.map((day, index) =>
                    day ? (
                      <button
                        type="button"
                        key={index}
                        className={`day ${
                          isBusy(key(day))
                            ? 'busy'
                            : 'free'
                        } ${
                          date === key(day)
                            ? 'selected'
                            : ''
                        }`}
                        disabled={isBusy(key(day))}
                        onClick={() => {
                          const selectedDate = key(day);

                          setDate(selectedDate);

                          document
                            .getElementById('booking')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                            });
                        }}
                      >
                        <span>{day.getDate()}</span>
                      </button>
                    ) : (
                      <div key={index} />
                    )
                  )}
                </div>

                <div className="legend">
                  <span>
                    <i
                      style={{
                        background: 'var(--blue)',
                      }}
                    />
                    свободно
                  </span>

                  <span>
                    <i
                      style={{
                        background: 'var(--red)',
                      }}
                    />
                    занято
                  </span>
                </div>

                {loadingCalendar && (
                  <div className="calendar-loading">
                    Загружаем календарь...
                  </div>
                )}
              </div>

              <div className="booking">
                <h3>Выбрано</h3>

                <p>
                  {date
                    ? `Дата: ${date}`
                    : 'Сначала выберите свободный день'}
                </p>

                <div className="cart">
                  {cart.length ? (
                    <>
                      {cart.map((service) => (
                        <div
                          className="cart-row"
                          key={service.id}
                        >
                          <span>{service.name}</span>

                          <button
                            type="button"
                            className="remove"
                            onClick={() =>
                              remove(service.id)
                            }
                          >
                            удалить
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="small">
                      Услуги пока не добавлены.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section className="section" id="booking">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Заявка</h2>

                <p>
                  Оставьте данные — мы свяжемся с вами для
                  подтверждения времени и итоговой
                  стоимости.
                </p>
              </div>
            </div>

            {sent ? (
              <div className="success">
                <b>Заявка отправлена.</b>
                <br />
                Она уже пришла мойщикам в Telegram. С
                вами свяжутся для подтверждения записи.
              </div>
            ) : (
              <form
                className="booking"
                onSubmit={submit}
              >
                <div
                  className="booking-grid"
                >
                  <div className="field">
                    <label>Имя *</label>

                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      required
                      placeholder="Ваше имя"
                    />
                  </div>

                  <div className="field">
                    <label>Номер телефона *</label>

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                      required
                      placeholder="+7 900 000-00-00"
                    />
                  </div>

                  <div className="field">
                    <label>Марка и модель *</label>

                    <input
                      value={form.carMake}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          carMake: e.target.value,
                        })
                      }
                      required
                      placeholder="Toyota Camry"
                    />
                  </div>

                  <div className="field">
                    <label>Госномер *</label>

                    <input
                      value={form.plate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          plate: e.target.value,
                        })
                      }
                      required
                      placeholder="А000АА 05"
                    />
                  </div>

                  <div className="field">
                    <label>Дата *</label>

                    <input
                      value={date}
                      readOnly
                      placeholder="Выберите в календаре выше"
                    />
                  </div>

                  <div className="field">
                    <label>Желаемое время *</label>

                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          time: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Дополнительно</label>

                  <textarea
                    rows={4}
                    value={form.extra}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        extra: e.target.value,
                      })
                    }
                    placeholder="Например: сильные загрязнения, пятна, запах, пожелания по времени…"
                  />
                </div>

                {error && (
                  <div
                    style={{
                      color: '#ff9da3',
                      marginBottom: 14,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  className="btn primary"
                  type="submit"
                >
                  Отправить заявку
                </button>

                <p
                  className="small"
                  style={{ marginTop: 12 }}
                >
                  Отправляя заявку, вы соглашаетесь на
                  обработку указанных данных для связи по
                  записи.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-title">
            Химчистка авто · Каспийск · Онлайн-запись
          </div>

          <div className="footer-contacts">
            <div className="footer-contact">
              <span>Артур</span>

              <a href="tel:+79858889263">
                +7 985 888-92-63
              </a>
            </div>

            <div className="footer-contact">
              <span>Гаджимурад</span>

              <a href="tel:+79637622227">
                +7 963 762-22-27
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
