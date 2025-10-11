import type { Checklist } from '@/types';

export interface ChecklistTemplate {
  name: string;
  category: Checklist['category'];
  description: string;
  items: Array<{
    question: string;
    requiresComment: boolean;
    criticalItem: boolean;
  }>;
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    name: 'Пожарная безопасность',
    category: 'fire_safety',
    description: 'Комплексная проверка соблюдения требований пожарной безопасности',
    items: [
      { question: 'Все ли огнетушители на месте и исправны?', requiresComment: false, criticalItem: true },
      { question: 'Свободны ли эвакуационные пути?', requiresComment: false, criticalItem: true },
      { question: 'Работает ли пожарная сигнализация?', requiresComment: true, criticalItem: true },
      { question: 'Есть ли актуальные планы эвакуации?', requiresComment: false, criticalItem: false },
      { question: 'Проведен ли инструктаж по пожарной безопасности?', requiresComment: true, criticalItem: false },
      { question: 'Соблюдаются ли правила хранения легковоспламеняющихся материалов?', requiresComment: true, criticalItem: true }
    ]
  },
  {
    name: 'Проверка оборудования',
    category: 'equipment',
    description: 'Оценка состояния и безопасности производственного оборудования',
    items: [
      { question: 'Имеются ли видимые повреждения оборудования?', requiresComment: true, criticalItem: true },
      { question: 'Проведено ли плановое техническое обслуживание в срок?', requiresComment: true, criticalItem: false },
      { question: 'Все ли защитные устройства функционируют?', requiresComment: false, criticalItem: true },
      { question: 'Установлены ли предупреждающие таблички?', requiresComment: false, criticalItem: false },
      { question: 'Ведутся ли журналы учета работы оборудования?', requiresComment: false, criticalItem: false }
    ]
  },
  {
    name: 'Средства индивидуальной защиты (СИЗ)',
    category: 'ppe',
    description: 'Проверка наличия и использования средств индивидуальной защиты',
    items: [
      { question: 'Все ли работники обеспечены необходимыми СИЗ?', requiresComment: true, criticalItem: true },
      { question: 'СИЗ в исправном состоянии и соответствуют требованиям?', requiresComment: true, criticalItem: true },
      { question: 'Работники правильно используют СИЗ?', requiresComment: false, criticalItem: false },
      { question: 'Проводится ли обучение по использованию СИЗ?', requiresComment: true, criticalItem: false },
      { question: 'Ведется ли учет выдачи СИЗ?', requiresComment: false, criticalItem: false }
    ]
  },
  {
    name: 'Рабочие места',
    category: 'workplace',
    description: 'Проверка организации и безопасности рабочих мест',
    items: [
      { question: 'Рабочие места содержатся в чистоте и порядке?', requiresComment: false, criticalItem: false },
      { question: 'Достаточное ли освещение на рабочих местах?', requiresComment: true, criticalItem: false },
      { question: 'Соблюдаются ли требования эргономики?', requiresComment: true, criticalItem: false },
      { question: 'Отсутствуют ли опасные факторы (острые края, выступы)?', requiresComment: true, criticalItem: true },
      { question: 'Размещены ли инструкции по охране труда?', requiresComment: false, criticalItem: false }
    ]
  },
  {
    name: 'Электробезопасность',
    category: 'electrical',
    description: 'Проверка соблюдения требований электробезопасности',
    items: [
      { question: 'Отсутствуют ли поврежденные кабели и розетки?', requiresComment: true, criticalItem: true },
      { question: 'Проведена ли проверка электрооборудования?', requiresComment: true, criticalItem: true },
      { question: 'Используются ли заземляющие устройства?', requiresComment: false, criticalItem: true },
      { question: 'Установлены ли УЗО и автоматические выключатели?', requiresComment: true, criticalItem: true },
      { question: 'Допущен ли персонал к работе с электрооборудованием?', requiresComment: true, criticalItem: true }
    ]
  },
  {
    name: 'Химическая безопасность',
    category: 'chemical',
    description: 'Проверка обращения с опасными химическими веществами',
    items: [
      { question: 'Правильно ли маркированы химические вещества?', requiresComment: true, criticalItem: true },
      { question: 'Соблюдаются ли условия хранения химикатов?', requiresComment: true, criticalItem: true },
      { question: 'Имеются ли паспорта безопасности веществ?', requiresComment: false, criticalItem: true },
      { question: 'Обеспечена ли вентиляция помещений?', requiresComment: true, criticalItem: true },
      { question: 'Доступны ли средства для нейтрализации разливов?', requiresComment: false, criticalItem: true },
      { question: 'Прошли ли работники инструктаж по химбезопасности?', requiresComment: true, criticalItem: false }
    ]
  },
  {
    name: 'Общая охрана труда',
    category: 'other',
    description: 'Базовая проверка соблюдения требований охраны труда',
    items: [
      { question: 'Проведен ли вводный инструктаж для новых работников?', requiresComment: true, criticalItem: true },
      { question: 'Актуальны ли инструкции по охране труда?', requiresComment: false, criticalItem: false },
      { question: 'Проводятся ли регулярные инструктажи?', requiresComment: true, criticalItem: false },
      { question: 'Ведется ли журнал регистрации инструктажей?', requiresComment: false, criticalItem: false },
      { question: 'Назначены ли ответственные лица?', requiresComment: true, criticalItem: true },
      { question: 'Проводятся ли медицинские осмотры работников?', requiresComment: true, criticalItem: true }
    ]
  },
  {
    name: 'Санитарно-гигиенические условия',
    category: 'other',
    description: 'Проверка санитарного состояния производственных помещений',
    items: [
      { question: 'Соблюдается ли температурный режим в помещениях?', requiresComment: true, criticalItem: false },
      { question: 'Обеспечена ли питьевая вода для работников?', requiresComment: false, criticalItem: false },
      { question: 'Соответствуют ли санузлы санитарным нормам?', requiresComment: true, criticalItem: false },
      { question: 'Проводится ли регулярная уборка помещений?', requiresComment: false, criticalItem: false },
      { question: 'Организованы ли места для приема пищи?', requiresComment: false, criticalItem: false }
    ]
  },
  {
    name: 'Работа на высоте',
    category: 'other',
    description: 'Проверка безопасности при выполнении работ на высоте',
    items: [
      { question: 'Имеются ли наряды-допуски на работу на высоте?', requiresComment: true, criticalItem: true },
      { question: 'Используются ли средства защиты от падения?', requiresComment: false, criticalItem: true },
      { question: 'Установлены ли ограждения опасных зон?', requiresComment: true, criticalItem: true },
      { question: 'Прошли ли работники обучение?', requiresComment: true, criticalItem: true },
      { question: 'Проверено ли состояние лестниц и стремянок?', requiresComment: true, criticalItem: true }
    ]
  }
];
