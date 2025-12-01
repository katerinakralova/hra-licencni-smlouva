# Licenční smlouva - Interaktivní hra

Jednoduchá 2D plošinovka vytvořená jako seminární práce pro předmět Právo ICT - soukromoprávní. Hráč ovládá postavičku právníka, která sbírá svitky obsahující jednotlivé články licenční smlouvy pro fotobanku.

## Zadání

Připravit jednoduchou licenční smlouvu pro fotobanku, ze které bude uživatelům zřejmé:
- Mohou obrázek použít pro vlastní účely
- Mohou jej upravovat
- Mohou jej spojit s jiným dílem
- Platí na jakémkoli teritoriu
- Nemusí uvádět původního autora
- **Nesmí jej používat komerčně**

## Spuštění

Otevřít https://katerinakralova.github.io/hra-licencni-smlouva/

## Ovládání

- **←→** - pohyb
- **↑** - skok (dvojitý skok možný)
- **↓** - dřep / propadnutí platformou

## Použité nástroje

- **MelonJS 17** - herní engine
- **Claude AI** - generování kódu 
- **ChatGPT** - generování grafiky

## Struktura projektu

```
├── index.html          # Hlavní HTML soubor
├── main.js             # Vstupní bod hry
└── js/
    ├── entities/
    │   ├── player.js   # Logika hráče
    │   ├── platform.js # Platformy
    │   └── scroll.js   # Sbíratelné svitky s textem
    ├── img/            # Obrázky (sprite postavy)
    └── screens/
        └── play.js     # Herní obrazovka a level
```

