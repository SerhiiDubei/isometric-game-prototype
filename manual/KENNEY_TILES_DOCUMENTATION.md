# Kenney Isometric Miniature Dungeon - Документація тайлів

## Загальна інформація

- **Пакет**: Kenney Isometric Miniature Dungeon (2.3)
- **Автор**: Kenney (www.kenney.nl)
- **Ліцензія**: Creative Commons Zero (CC0) - безкоштовно для використання
- **Дата створення**: 15-02-2019
- **Інструкції**: https://kenney.nl/documentation/game-assets/isometric

## Структура файлів

### Папки:
- **`Isometric/`** - 288 файлів (ізометричні тайли)
- **`Angle/`** - 288 файлів (кутові тайли)
- **`Characters/Male/`** - 168 файлів (персонажі)

### Формат імені файлів:
Кожен тайл має 4 орієнтації:
- `_E` - East (Схід)
- `_N` - North (Північ)
- `_S` - South (Південь)
- `_W` - West (Захід)

Приклад: `stoneWall_E.png`, `stoneWall_N.png`, `stoneWall_S.png`, `stoneWall_W.png`

## Категорії тайлів

### 1. Підлоги та основи (Floors & Base)
- `dirt` - Земля
- `dirtTiles` - Земля з плитками
- `stone` - Камінь
- `stoneTile` - Кам'яна плитка
- `stoneUneven` - Нерівний камінь
- `stoneMissingTiles` - Камінь з відсутніми плитками
- `planks` - Дерев'яні дошки
- `planksBroken` - Зламані дошки
- `planksHole` - Дошки з дірою

### 2. Стіни (Walls)
- `stoneWall` - Кам'яна стіна
- `stoneWallAged` - Стара кам'яна стіна
- `stoneWallBroken` - Зламана кам'яна стіна
- `stoneWallAgedLeft` - Стара стіна (ліва)
- `stoneWallAgedRight` - Стара стіна (права)
- `stoneWallBrokenLeft` - Зламана стіна (ліва)
- `stoneWallBrokenRight` - Зламана стіна (права)
- `stoneWallHalf` - Половина стіни
- `stoneWallHole` - Стіна з дірою
- `stoneWallRound` - Кругла стіна
- `stoneWallRoundBroken` - Зламана кругла стіна
- `stoneWallTop` - Верх стіни
- `stoneWallStructure` - Структура стіни

### 3. Стіни з елементами (Walls with Features)
- `stoneWallCorner` - Кут стіни
- `stoneWallLeft` - Ліва стіна
- `stoneWallRight` - Права стіна
- `stoneWallSide` - Бічна стіна
- `stoneWallSideUneven` - Нерівна бічна стіна
- `stoneWallInset` - Вставка в стіну
- `stoneWallArchway` - Арка в стіні

### 4. Двері та ворота (Doors & Gates)
- `stoneWallDoor` - Двері
- `stoneWallDoorClosed` - Закриті двері
- `stoneWallDoorOpen` - Відкриті двері
- `stoneWallDoorBars` - Двері з решіткою
- `stoneWallGate` - Ворота
- `stoneWallGateClosed` - Закриті ворота
- `stoneWallGateOpen` - Відкриті ворота
- `stoneWallGateBars` - Ворота з решіткою

### 5. Вікна (Windows)
- `stoneWallWindow` - Вікно
- `stoneWallWindowBars` - Вікно з решіткою
- `stoneWallRoundWindow` - Кругле вікно

### 6. Колони та опори (Columns & Supports)
- `stoneColumn` - Кам'яна колона
- `stoneColumnWood` - Колона з дерева
- `stoneWallColumn` - Колона в стіні
- `stoneWallColumnIn` - Внутрішня колона
- `woodenSupports` - Дерев'яні опори
- `woodenSupportsBeam` - Дерев'яна балка
- `woodenSupportsBlock` - Дерев'яний блок
- `woodenSupportBeams` - Дерев'яні балки

### 7. Сходи (Stairs)
- `stairs` - Сходи
- `stairsAged` - Старі сходи
- `stairsCorner` - Кутові сходи
- `stairsSpiral` - Гвинтові сходи
- `stoneStep` - Кам'яна сходинка
- `stoneSteps` - Кам'яні сходи

### 8. Мости (Bridges)
- `bridge` - Міст
- `bridgeBroken` - Зламаний міст

### 9. Меблі (Furniture)
- `chair` - Стілець
- `tableRound` - Круглий стіл
- `tableRoundChairs` - Круглий стіл зі стільцями
- `tableRoundItemsChairs` - Круглий стіл з предметами та стільцями
- `tableShort` - Короткий стіл
- `tableShortChairs` - Короткий стіл зі стільцями
- `tableChairsBroken` - Зламаний стіл зі стільцями

### 10. Контейнери (Containers)
- `chestClosed` - Закрита скриня
- `chestOpen` - Відкрита скриня
- `barrel` - Бочка
- `barrels` - Бочки
- `barrelsStacked` - Складені бочки
- `woodenCrate` - Дерев'яна скриня
- `woodenCrates` - Дерев'яні скрині
- `woodenPile` - Дерев'яна купа

## Властивості тайлів

### Walkable (прохідні):
- `dirt`, `dirtTiles`
- `stone`, `stoneTile`, `stoneUneven`
- `planks`, `planksBroken`, `planksHole`
- `stairs*`, `stoneStep`, `stoneSteps`
- `bridge*`

### Non-walkable (непрохідні):
- Всі стіни (`stoneWall*`)
- Всі колони (`stoneColumn*`, `woodenSupports*`)
- Меблі (`chair`, `table*`)
- Контейнери (`chest*`, `barrel*`, `woodenCrate*`)

## Інтеграція в гру

### Шляхи до файлів:
- Ізометричні тайли: `/Isometric/[tileName]_[direction].png`
- Кутові тайли: `/Angle/[tileName]_[direction].png`

### Приклад використання:
```typescript
{
  id: "stoneWall",
  type: "wall",
  walkable: false,
  imageUrl: "/Isometric/stoneWall_E.png", // Для напрямку East
  // Або використовувати всі 4 напрямки залежно від орієнтації
}
```

## Примітки

1. Всі тайли мають 4 орієнтації (_E, _N, _S, _W)
2. Для ізометричної проєкції використовувати папку `Isometric/`
3. Для кутової проєкції використовувати папку `Angle/`
4. Розмір тайлів стандартний для ізометричної проєкції
5. Всі тайли готові до використання без додаткової обробки

