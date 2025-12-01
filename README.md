# Licenční smlouva - Interaktivní hra

Jednoduchá 2D plošinovka vytvořená jako seminární práce pro předmět právo. Hráč ovládá postavičku právníka, která sbírá svitky obsahující jednotlivé články licenční smlouvy pro fotobanku.

## Zadání

Připravit jednoduchou licenční smlouvu pro fotobanku, ze které bude uživatelům zřejmé:
- Mohou obrázek použít pro vlastní účely
- Mohou jej upravovat
- Mohou jej spojit s jiným dílem
- Platí na jakémkoli teritoriu
- Nemusí uvádět původního autora
- **Nesmí jej používat komerčně**

## Spuštění

Otevřít `index.html` v prohlížeči (vyžaduje internetové připojení pro načtení MelonJS knihovny).

## Ovládání

- **←→** nebo **A/D** - pohyb
- **↑/W/Mezerník** - skok (dvojitý skok možný)
- **↓/S** - dřep / propadnutí platformou

## Použité nástroje

- **MelonJS 17** - herní engine
- **Claude AI** - asistence při vývoji
- **Vlastní grafika** - sprite postavy

## Struktura projektu

```
├── index.html          # Hlavní HTML soubor
├── main.js             # Vstupní bod hry
├── img/                # Obrázky (sprite postavy)
└── js/
    ├── entities/
    │   ├── player.js   # Logika hráče
    │   ├── platform.js # Platformy
    │   └── scroll.js   # Sbíratelné svitky s textem
    └── screens/
        └── play.js     # Herní obrazovka a level
```

## Licence

Seminární práce - pouze pro vzdělávací účely.
