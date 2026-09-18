import { NextResponse } from 'next/server';

import { ensureDb, sql } from '../../../lib/db';
import { adminIds, tg } from '../../../lib/telegram';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const msg = update?.message;

    // Игнорируем сообщения без текста
    if (!msg?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat?.id;
    const userId = String(msg.from?.id || '');
    const text = String(msg.text).trim();

    // Проверяем доступ администратора
    if (!adminIds().includes(userId)) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '❌ У вас нет доступа к управлению календарём.',
      });

      return NextResponse.json({ ok: true });
    }

    // Проверяем подключение к базе
    await ensureDb();

    /*
      Поддерживаются оба варианта:

      занять 2026-09-22
      /занять 2026-09-22

      освободить 2026-09-22
      /освободить 2026-09-22
    */

    const match = text.match(
      /^\/?(занять|освободить)\s+(\d{4}-\d{2}-\d{2})$/i
    );

    // Если команда написана неправильно
    if (!match) {
      await tg('sendMessage', {
        chat_id: chatId,
        text:
          '❗ Неверная команда.\n\n' +
          'Примеры:\n\n' +
          '🔴 занять 2026-09-22\n' +
          '🔵 освободить 2026-09-22\n\n' +
          'Также можно:\n' +
          '/занять 2026-09-22\n' +
          '/освободить 2026-09-22',
      });

      return NextResponse.json({ ok: true });
    }

    const action = match[1].toLowerCase();
    const date = match[2];

    // Проверяем, что дата существует
    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: `❌ Некорректная дата: ${date}`,
      });

      return NextResponse.json({ ok: true });
    }

    // =========================
    // ЗАНЯТЬ ДАТУ
    // =========================

    if (action === 'занять') {
      await sql`
        INSERT INTO blocked_dates (date)
        VALUES (${date})
        ON CONFLICT DO NOTHING
      `;

      await tg('sendMessage', {
        chat_id: chatId,
        text:
          `🔴 Дата ${date} занята.\n\n` +
          `На сайте эта дата теперь недоступна для записи.`,
      });

      return NextResponse.json({ ok: true });
    }

    // =========================
    // ОСВОБОДИТЬ ДАТУ
    // =========================

    if (action === 'освободить') {
      const result = await sql`
        DELETE FROM blocked_dates
        WHERE date = ${date}
        RETURNING date
      `;

      if (result.length === 0) {
        await tg('sendMessage', {
          chat_id: chatId,
          text:
            `ℹ️ Дата ${date} уже была свободна.\n\n` +
            `На сайте она доступна для записи.`,
        });
      } else {
        await tg('sendMessage', {
          chat_id: chatId,
          text:
            `🔵 Дата ${date} освобождена.\n\n` +
            `Теперь на сайте она снова доступна для записи.`,
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Telegram webhook error',
      },
      {
        status: 500,
      }
    );
  }
}
