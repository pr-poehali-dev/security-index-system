# Журнал исправлений — 23.02.2026

| # | Файл | Строка | Было | Стало | Зачем |
|---|------|--------|------|-------|-------|
| 1 | `package.json` | dependencies | `"recharts": "^3.2.1"` | `"recharts": "2.15.3"` | recharts 3.x требует React 19, проект на React 18 — две копии React в бандле, краш приложения |
| 2 | `package.json` | dependencies | `"react-window": "^2.2.0"` | `"react-window": "1.8.11"` | react-window 2.x требует React 19 — аналогично п.1 |
| 3 | `package.json` | dependencies | `"@types/react-window": "^2.0.0"` | `"@types/react-window": "1.8.8"` | Типы должны соответствовать версии пакета |
| 4 | `package.json` | devDependencies | `"react": "^18.3.1"` (дубль) | удалено | react был указан и в dependencies, и в devDependencies — потенциальный конфликт версий |
| 5 | `package.json` | devDependencies | `"@vitejs/plugin-react": "^4.4.1"` | удалено | Был установлен вместе с `@vitejs/plugin-react-swc` — два плагина конфликтуют |
| 6 | `src/modules/budget/components/ExpenseHistoryTable.tsx` | 82 | `org?.shortName \|\| org?.fullName \|\| '—'` | `org?.name \|\| '—'` | Тип Organization не имеет полей shortName/fullName, только name |
| 7 | `src/modules/budget/components/AddExpenseDialog.tsx` | 173 | `{org.shortName \|\| org.fullName}` | `{org.name}` | Аналогично п.6 |
| 8 | `src/components/ui/icon.tsx` | 4–18 | Отсутствовали импорты Banknote, Calculator, FileSearch, Percent | Добавлены импорты | Иконки использовались в модуле бюджета, но не были импортированы |
| 9 | `src/components/ui/icon.tsx` | 21–34 | Отсутствовали в типе IconName | Добавлены Banknote, Calculator, FileSearch, Percent | TypeScript не пропускал использование незарегистрированных имён иконок |
| 10 | `src/components/ui/icon.tsx` | 41–55 | Отсутствовали в ICON_MAP | Добавлены Banknote, Calculator, FileSearch, Percent | Без записи в маппинге иконка показывала fallback вместо нужной |
| 11 | `src/stores/budgetStore.ts` | 271 | `{ name: 'budget-storage-v2' }` | `{ name: 'budget-storage-v2', partialize: (state) => ({ categories, expenses, organizationPlans, selectedYear }) }` | persist сохранял функции-геттеры в localStorage — при десериализации они терялись |
| 12 | `src/stores/settingsStore.ts` | 695 | `{ name: 'settings-storage-v3' }` | `{ name: 'settings-storage-v3', partialize: (state) => ({ ...только данные... }) }` | certificationAreas содержал функцию getAreasForCategory — не сериализуется в JSON |
