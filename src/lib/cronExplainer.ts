/**
 * ============================================================================
 * CRON EXPRESSION EXPLAINER & VALIDATOR UTILITY
 * Translates standard 5-part UNIX cron expressions into real-time natural language
 * for Persian (FA) and English (EN) user interfaces.
 * ============================================================================
 */

export interface CronDescription {
  isValid: boolean;
  description: string;
  badgeType: 'valid' | 'invalid' | 'warning';
}

export function describeCronExpression(cron: string, lang: string = 'fa'): CronDescription {
  const trimmed = (cron || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      description: lang === 'fa' ? 'لطفاً عبارت زمان‌بندی کرون را وارد کنید.' : 'Please enter a cron expression.',
      badgeType: 'warning'
    };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    return {
      isValid: false,
      description: lang === 'fa' 
        ? `فرمت نامعتبر است (${parts.length} بخش از ۵ بخش). ساختار: دقیقه ساعت روز ماه روز‌هفته (مانند 0 2 * * *)` 
        : `Invalid syntax (${parts.length}/5 parts). Format: minute hour day month day-of-week (e.g. 0 2 * * *)`,
      badgeType: 'invalid'
    };
  }

  const [min, hour, dom, month, dow] = parts;

  // Validate characters
  const validRegex = /^[\d\*\/\,\-]+$/;
  for (const p of parts) {
    if (!validRegex.test(p)) {
      return {
        isValid: false,
        description: lang === 'fa' ? `کاراکتر نامعتبر "${p}" در عبارت کرون یافت شد.` : `Invalid character "${p}" in cron expression.`,
        badgeType: 'invalid'
      };
    }
  }

  // Persian day names mapping (0 or 7 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayNamesFa: Record<string, string> = {
    '0': 'یکشنبه',
    '7': 'یکشنبه',
    '1': 'دوشنبه',
    '2': 'سه‌شنبه',
    '3': 'چهارشنبه',
    '4': 'پنج‌شنبه',
    '5': 'جمعه',
    '6': 'شنبه'
  };

  const dayNamesEn: Record<string, string> = {
    '0': 'Sunday',
    '7': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday'
  };

  // Persian Month names
  const monthNamesFa: Record<string, string> = {
    '1': 'ژانویه (دی/بهمن)',
    '2': 'فوریه (بهمن/اسفند)',
    '3': 'مارس (اسفند/فروردین)',
    '4': 'آوریل (فروردین/اردیبهشت)',
    '5': 'مه (اردیبهشت/خرداد)',
    '6': 'ژوئن (خرداد/تیر)',
    '7': 'ژوئیه (تیر/مرداد)',
    '8': 'اوت (مرداد/شهریور)',
    '9': 'سپتامبر (شهریور/مهر)',
    '10': 'اکتبر (مهر/آبان)',
    '11': 'نوامبر (آبان/آذر)',
    '12': 'دسامبر (آذر/دی)'
  };

  const monthNamesEn: Record<string, string> = {
    '1': 'January', '2': 'February', '3': 'March', '4': 'April',
    '5': 'May', '6': 'June', '7': 'July', '8': 'August',
    '9': 'September', '10': 'October', '11': 'November', '12': 'December'
  };

  // Format Time string
  const formatTime = (h: string, m: string): { fa: string; en: string } => {
    if (h === '*' && m === '*') {
      return { fa: 'در هر دقیقه', en: 'every minute' };
    }
    if (h === '*' && m.startsWith('*/')) {
      const step = m.replace('*/', '');
      return { fa: `هر ${step} دقیقه یک‌بار`, en: `every ${step} minutes` };
    }
    if (h.startsWith('*/')) {
      const step = h.replace('*/', '');
      const minStr = m === '*' || m === '0' ? '00' : m.padStart(2, '0');
      return { fa: `هر ${step} ساعت یک‌بار (دقیقه ${minStr})`, en: `every ${step} hours at minute :${minStr}` };
    }
    if (h === '*' && m !== '*') {
      const minStr = m.padStart(2, '0');
      return { fa: `هر ساعت در دقیقه ${minStr}`, en: `every hour at minute :${minStr}` };
    }
    if (h !== '*' && m === '*') {
      return { fa: `در ساعت ${h}:00 به بعد در هر دقیقه`, en: `at hour ${h} every minute` };
    }

    // Specific hour and minute (e.g. 0 2)
    const hours = h.split(',').map(n => n.trim());
    const mins = m.split(',').map(n => n.trim().padStart(2, '0'));

    if (hours.length === 1 && mins.length === 1) {
      const hh = parseInt(hours[0], 10);
      const mm = mins[0];
      const ampm = hh >= 12 ? 'عصر/شب' : 'بامداد/صبح';
      const ampmEn = hh >= 12 ? 'PM' : 'AM';
      return {
        fa: `ساعت ${hours[0].padStart(2, '0')}:${mm} (${ampm})`,
        en: `at ${hours[0].padStart(2, '0')}:${mm} (${ampmEn})`
      };
    }

    const timesFa = hours.map(hr => mins.map(mn => `${hr.padStart(2, '0')}:${mn}`).join(' و ')).join(' و ');
    return {
      fa: `در ساعات ${timesFa}`,
      en: `at times ${timesFa}`
    };
  };

  try {
    // 1. Every minute (* * * * *)
    if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      return {
        isValid: true,
        description: lang === 'fa' ? '⚡ هر دقیقه به طور پیوسته' : '⚡ Every minute continuously',
        badgeType: 'valid'
      };
    }

    // 2. Every N minutes (*/X * * * *)
    if (min.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      const step = min.replace('*/', '');
      return {
        isValid: true,
        description: lang === 'fa' ? `⏱️ هر ${step} دقیقه یک‌بار` : `⏱️ Every ${step} minutes`,
        badgeType: 'valid'
      };
    }

    // 3. Hourly at minute M (0 * * * * or 30 * * * *)
    if (!min.includes('/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      const mStr = min === '0' ? '۰۰ (ابتدای هر ساعت)' : min.padStart(2, '0');
      return {
        isValid: true,
        description: lang === 'fa' ? `⏰ هر ساعت در دقیقه ${mStr}` : `⏰ Every hour at minute ${min.padStart(2, '0')}`,
        badgeType: 'valid'
      };
    }

    // 4. Every N hours (0 */X * * *)
    if (hour.startsWith('*/') && dom === '*' && month === '*' && dow === '*') {
      const step = hour.replace('*/', '');
      const mStr = min === '0' ? '۰۰' : min.padStart(2, '0');
      return {
        isValid: true,
        description: lang === 'fa' ? `⏳ هر ${step} ساعت یک‌بار در دقیقه ${mStr}` : `⏳ Every ${step} hours at minute :${mStr}`,
        badgeType: 'valid'
      };
    }

    const timeDesc = formatTime(hour, min);

    // 5. Day of week specified (e.g. 0 2 * * 0 or 0 2 * * 1-5 or 0 2 * * 3)
    if (dow !== '*' && dom === '*' && month === '*') {
      if (dow === '1-5') {
        return {
          isValid: true,
          description: lang === 'fa' 
            ? `📅 روزهای کاری (دوشنبه تا جمعه) ${timeDesc.fa}` 
            : `📅 Every weekday (Mon-Fri) ${timeDesc.en}`,
          badgeType: 'valid'
        };
      }
      if (dow === '0,6' || dow === '6,0') {
        return {
          isValid: true,
          description: lang === 'fa' 
            ? `🏖️ آخر هفته‌ها (شنبه و یکشنبه) ${timeDesc.fa}` 
            : `🏖️ Weekends (Sat & Sun) ${timeDesc.en}`,
          badgeType: 'valid'
        };
      }
      const daysFa = dow.split(',').map(d => dayNamesFa[d] || `روز ${d}`).join(' و ');
      const daysEn = dow.split(',').map(d => dayNamesEn[d] || `Day ${d}`).join(' and ');
      return {
        isValid: true,
        description: lang === 'fa' 
          ? `🗓️ هر هفته در روزهای ${daysFa} ${timeDesc.fa}` 
          : `🗓️ Weekly on ${daysEn} ${timeDesc.en}`,
        badgeType: 'valid'
      };
    }

    // 6. Day of month specified (e.g. 0 2 1 * * or 0 2 */2 * *)
    if (dom !== '*' && month === '*' && dow === '*') {
      if (dom.startsWith('*/')) {
        const step = dom.replace('*/', '');
        return {
          isValid: true,
          description: lang === 'fa' 
            ? `🔄 هر ${step} روز یک‌بار ${timeDesc.fa}` 
            : `🔄 Every ${step} days ${timeDesc.en}`,
          badgeType: 'valid'
        };
      }
      if (dom === '1') {
        return {
          isValid: true,
          description: lang === 'fa' 
            ? `📆 روز اول هر ماه ${timeDesc.fa}` 
            : `📆 On the 1st of every month ${timeDesc.en}`,
          badgeType: 'valid'
        };
      }
      const doms = dom.split(',').join(' و ');
      return {
        isValid: true,
        description: lang === 'fa' 
          ? `📆 در روزهای ${doms} هر ماه ${timeDesc.fa}` 
          : `📆 On day ${dom} of every month ${timeDesc.en}`,
        badgeType: 'valid'
      };
    }

    // 7. Month specified (e.g. 0 2 1 1 * or 0 2 * 1 *)
    if (month !== '*') {
      const mNameFa = monthNamesFa[month] || `ماه ${month}`;
      const mNameEn = monthNamesEn[month] || `Month ${month}`;
      const domStrFa = dom === '*' ? 'هر روز' : `روز ${dom}`;
      const domStrEn = dom === '*' ? 'every day' : `on day ${dom}`;
      return {
        isValid: true,
        description: lang === 'fa' 
          ? `🍂 در ${mNameFa} (${domStrFa}) ${timeDesc.fa}` 
          : `🍂 In ${mNameEn} (${domStrEn}) ${timeDesc.en}`,
        badgeType: 'valid'
      };
    }

    // 8. General daily schedule (0 2 * * *)
    if (dom === '*' && month === '*' && dow === '*') {
      return {
        isValid: true,
        description: lang === 'fa' 
          ? `🌅 هر روز ${timeDesc.fa}` 
          : `🌅 Every day ${timeDesc.en}`,
        badgeType: 'valid'
      };
    }

    // 9. Composite case
    return {
      isValid: true,
      description: lang === 'fa' 
        ? `⏰ زمان‌بندی: ${timeDesc.fa} (روز ماه: ${dom}، ماه: ${month}، روز هفته: ${dow})` 
        : `⏰ Schedule: ${timeDesc.en} (DOM: ${dom}, Month: ${month}, DOW: ${dow})`,
      badgeType: 'valid'
    };
  } catch (e) {
    return {
      isValid: true,
      description: lang === 'fa' ? `زمان‌بندی کرون: ${trimmed}` : `Cron schedule: ${trimmed}`,
      badgeType: 'valid'
    };
  }
}
