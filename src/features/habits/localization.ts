import type { Habit } from '@/types/supabase';

type HabitCopy = { name: string; description: string };

const CATEGORY_BG: Record<string, string> = {
  Mobility: 'Мобилност',
  Food: 'Храна',
  Heating: 'Отопление',
  'Household Activities': 'Домакинство',
  waste: 'Намаляване на отпадъците',
  energy: 'Енергия',
  water: 'Вода',
  lifestyle: 'Начин на живот',
  community: 'Общност',
  other: 'Други',
};

const SUBCATEGORY_BG: Record<string, string> = {
  Carpool: 'Споделено пътуване',
  'Public Transport': 'Обществен транспорт',
  'Public Transit': 'Обществен транспорт',
  'Vehicle Efficiency': 'Ефективност на автомобила',
  'Plant-Based': 'Растително хранене',
  'Local & Sustainable': 'Местно и устойчиво',
  Insulation: 'Изолация',
  'System Upgrade': 'Подобряване на системата',
  'Smart Devices': 'Умни устройства',
  Laundry: 'Пране',
  Lighting: 'Осветление',
  'General Conservation': 'Разумно потребление',
  'Eco-Driving': 'Еко шофиране',
  'Electric Vehicle': 'Електрически автомобил',
  'Food Waste Reduction': 'Намаляване на хранителните отпадъци',
  'Thermostat Adjustment': 'Настройка на термостата',
  Cycling: 'Колоездене',
  Walking: 'Ходене пеша',
  Telecommuting: 'Работа от дома',
  'Hot Water': 'Топла вода',
  Electronics: 'Електроника',
  Recycling: 'Рециклиране',
  'Green Energy': 'Зелена енергия',
  Consumption: 'Потребление',
  Composting: 'Компостиране',
};

const HABIT_BG: Record<string, HabitCopy> = {
  'Carpool with colleagues': { name: 'Сподели пътуването с колеги', description: 'Пътувайте заедно с колеги или приятели, за да намалите емисиите на човек.' },
  'Organize a school carpool': { name: 'Организирай споделено пътуване до училище', description: 'Обединете пътуванията на децата от квартала в един автомобил.' },
  'Buy a weekly/monthly transit pass': { name: 'Купи седмична или месечна карта', description: 'Използвайте редовно обществения транспорт вместо автомобил.' },
  'Keep tires properly inflated': { name: 'Поддържай правилно налягане в гумите', description: 'Правилното налягане подобрява разхода на гориво и намалява емисиите.' },
  'Try “Meatless Monday”': { name: 'Опитай „Понеделник без месо“', description: 'Хранете се без месо поне един ден седмично.' },
  'Choose organic or regenerative farmed products': { name: 'Избирай био или регенеративно произведени храни', description: 'Подкрепете по-устойчиви земеделски практики с по-ниски емисии.' },
  'Seal windows and doors': { name: 'Уплътни прозорците и вратите', description: 'Ограничете загубата на топлина и подобрете енергийната ефективност.' },
  'Install or use a smart thermostat': { name: 'Използвай умен термостат', description: 'Автоматизирайте отоплението и охлаждането, за да не се губи енергия.' },
  'Use smart plugs or power strips': { name: 'Използвай умни контакти или разклонители', description: 'Изключвайте автоматично устройствата и намалете консумацията в режим на готовност.' },
  'Hang-dry laundry': { name: 'Простирай прането', description: 'Избягвайте сушилнята и намалете потреблението на електричество или газ.' },
  'Turn off lights in unused rooms': { name: 'Гаси лампите в празните стаи', description: 'Лесен и ефективен начин да намалите употребата на електричество.' },
  'Avoid single-use plastics at home': { name: 'Избягвай пластмасата за еднократна употреба у дома', description: 'Използвайте съдове и прибори за многократна употреба.' },
  'Eat a plant-based meal': { name: 'Хапни растително ястие', description: 'Замяната на месото и млечните продукти с растителна храна може осезаемо да намали въглеродния отпечатък на храненето.' },
  'Practice eco-driving': { name: 'Шофирай икономично', description: 'Равномерната скорост, плавното ускорение и липсата на излишен празен ход намаляват разхода на гориво.' },
  'Use an electric vehicle': { name: 'Използвай електрически автомобил', description: 'Електрическият автомобил обикновено има по-ниски емисии през жизнения си цикъл, особено при по-чиста електроенергия.' },
  'Choose local and seasonal foods': { name: 'Избирай местни и сезонни храни', description: 'Сезонната местна продукция ограничава нуждата от дълъг транспорт и енергоемки оранжерии.' },
  'Reduce food waste': { name: 'Намали хранителните отпадъци', description: 'Планирайте храненията, съхранявайте правилно храната и използвайте остатъците.' },
  'Lower the thermostat in winter': { name: 'Намали термостата през зимата', description: 'Понижаването с един градус може да спести приблизително 7% от енергията за отопление.' },
  'Raise the thermostat in summer (use less AC)': { name: 'Повиши термостата през лятото', description: 'По-високата настройка и по-рядкото използване на климатик пестят електричество.' },
  'Use public transportation': { name: 'Използвай обществен транспорт', description: 'Автобусът или влакът вместо личен автомобил намалява емисиите от ежедневното пътуване.' },
  'Bike instead of driving': { name: 'Карай колело вместо автомобил', description: 'Замяната на кратките пътувания с колоездене значително намалява транспортния отпечатък.' },
  'Walk instead of driving short distances': { name: 'Ходи пеша на кратки разстояния', description: 'За близки задачи изберете ходенето пеша и избегнете емисиите от автомобила.' },
  'Telecommute (work from home)': { name: 'Работи от дома', description: 'Работата от дома спестява емисиите от пътуването до работното място.' },
  'Improve home insulation': { name: 'Подобри изолацията на дома', description: 'Добрата изолация и уплътнение намаляват нуждата от отопление и охлаждане.' },
  'Take shorter hot showers': { name: 'Вземай по-кратки топли душове', description: 'По-краткият душ намалява водата и енергията за нейното затопляне.' },
  'Wash laundry in cold water': { name: 'Пери със студена вода', description: 'Студената програма пести голяма част от енергията за едно пране.' },
  'Air-dry clothes (avoid the dryer)': { name: 'Суши дрехите на въздух', description: 'Простирането вместо сушилнята спестява значително количество енергия.' },
  'Switch to LED lighting': { name: 'Премини към LED осветление', description: 'LED крушките използват много по-малко електричество за същото количество светлина.' },
  'Unplug electronics when not in use': { name: 'Изключвай неизползваната електроника', description: 'Премахнете скритата консумация на устройствата в режим на готовност.' },
  'Recycle paper, plastic, metal, and glass': { name: 'Рециклирай хартия, пластмаса, метал и стъкло', description: 'Разделното събиране намалява енергията за производство от нови суровини.' },
  'Use renewable energy at home': { name: 'Използвай възобновяема енергия у дома', description: 'Изберете зелена електроенергия или собствено производство от възобновяем източник.' },
  'Buy fewer new products (reduce consumption)': { name: 'Купувай по-малко нови продукти', description: 'Избирайте употребявани вещи, ремонтирайте и удължавайте живота на това, което имате.' },
  'Compost food scraps': { name: 'Компостирай хранителните остатъци', description: 'Компостирането връща органичната материя в почвата и избягва метана от депонирането.' },
};

export function localizeHabitCategory(value: string, locale: 'en' | 'bg') {
  return locale === 'bg' ? CATEGORY_BG[value] || value : value;
}

export function localizeHabitSubcategory(value: string, locale: 'en' | 'bg') {
  return locale === 'bg' ? SUBCATEGORY_BG[value] || value : value;
}

export function localizeHabit(habit: Habit, locale: 'en' | 'bg'): Habit {
  if (locale !== 'bg') return habit;
  const copy = HABIT_BG[habit.name];
  return copy ? { ...habit, ...copy } : habit;
}
