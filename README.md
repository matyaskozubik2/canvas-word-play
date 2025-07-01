
# 🎨 DrawGuess - Moderní multiplayerová kreslící hra

Moderní webová hra inspirovaná skribbl.io s pokročilým designem, real-time funkcionalitou a podporou mobilních zařízení.

## ✨ Funkce

### 🎮 Herní mechaniky
- **Real-time kreslení** - Plynulé kreslení synchronizované mezi všemi hráči
- **Chytrý chat** - Automatické rozpoznání správných odpovědí
- **Vícejazyčná podpora** - Slovníky v češtině, angličtině a dalších jazycích
- **Pokročilé skórování** - Bodování podle rychlosti odpovědi
- **Místnosti až pro 12 hráčů** - Flexibilní velikost herních místností

### 🎨 Design a UX
- **Moderní UI** - Zaoblený design s gradientními pozadími
- **Tmavý/světlý režim** - Automatická detekce preferencí systému
- **Responsivní design** - Optimalizováno pro desktop i mobil
- **Plynulé animace** - Mikro-interakce a přechody
- **Glassmorphism efekty** - Moderní průhledné komponenty

### 🛠️ Technické vlastnosti
- **TypeScript** - Typová bezpečnost napříč celou aplikací
- **React 18** - Nejnovější React s concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Kvalitní komponenty s přístupností
- **Canvas API** - Pokročilé kreslicí nástroje

## 🚀 Rychlý start

### Předpoklady
- Node.js 18+ 
- npm nebo yarn

### Instalace
```bash
# Klonování repositáře
git clone https://github.com/your-username/drawguess.git
cd drawguess

# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev
```

Aplikace bude dostupná na `http://localhost:8080`

## 📁 Struktura projektu

```
src/
├── components/          # Znovupoužitelné komponenty
│   ├── ui/             # Shadcn/UI komponenty
│   ├── DrawingCanvas.tsx
│   ├── ChatBox.tsx
│   ├── GameSettings.tsx
│   └── ...
├── pages/              # Stránky aplikace
│   ├── Index.tsx       # Úvodní stránka
│   ├── Lobby.tsx       # Lobby místnosti
│   ├── Game.tsx        # Herní obrazovka
│   └── Results.tsx     # Výsledky
├── hooks/              # Custom React hooks
├── lib/                # Utility funkce
└── types/              # TypeScript definice
```

## 🎮 Jak hrát

### 1. Vytvobění nebo připojení ke hře
- Zadejte své jméno
- Vytvořte novou místnost nebo se připojte pomocí kódu
- Čekejte na další hráče

### 2. Nastavení hry (pouze hostitel)
- Počet kol (1-10)
- Čas na kreslení (30-180s)
- Maximální počet hráčů (2-12)
- Výběr jazyka

### 3. Hraní
- **Kreslení**: Když jste na řadě, kreslíte zadané slovo
- **Hádání**: Ostatní hráči píšou odpovědi do chatu
- **Bodování**: Body za rychlost správné odpovědi
- **Kola**: Střídání kreslení mezi všemi hráči

### 4. Výsledky
- Zobrazení finálního pořadí
- Statistiky hry
- Možnost hrát znovu

## 🛠️ Kreslicí nástroje

- **Barevná paleta** - 10 základních barev
- **Velikost štětce** - 1-20px
- **Guma** - Mazání částí kresby
- **Vymazání** - Smazání celé kresby
- **Export** - Stažení kresby jako PNG

## 🌍 Jazyková podpora

- 🇨🇿 Čeština

## 📱 Mobilní podpora

Aplikace je plně optimalizována pro mobilní zařízení:
- Touch kreslení na canvas
- Responsivní layout
- Optimalizované ovládání
- Gestůre support

## 🔧 Vývoj

### Dostupné skripty

```bash
# Vývojový server
npm run dev

# Build pro produkci
npm run build

# Preview buildu
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

### Struktura komponent

Komponenty jsou organizovány podle atomic design principů:
- **Atoms**: Základní UI komponenty (Button, Input, ...)
- **Molecules**: Kombinace atomů (PlayerCard, ChatMessage, ...)
- **Organisms**: Komplexní komponenty (GameSettings, DrawingCanvas, ...)
- **Pages**: Kompletní stránky aplikace

## 🎯 Budoucí vylepšení

### V plánu
- [ ] Socket.IO backend pro real-time funkcionalidad
- [ ] MongoDB databáze pro persistenci
- [ ] Spektator mód
- [ ] Vlastní balíčky slov
- [ ] Hlasové zprávy
- [ ] Replay systém
- [ ] Turnajový mód
- [ ] Achievementy a statistiky

### Technické vylepšení
- [ ] PWA podpora
- [ ] Offline mód
- [ ] WebRTC pro P2P komunikaci
- [ ] Redis cache
- [ ] Docker kontejnerizace


## 📄 Licence

Tento projekt je licencován pod MIT licencí - detaily viz [LICENSE](LICENSE) soubor.

## 🙏 Poděkování

- [skribbl.io](https://skribbl.io) za inspiraci originální hry
- [Shadcn/UI](https://ui.shadcn.com) za kvalitní komponenty
- [Lucide](https://lucide.dev) za krásné ikony
- [Tailwind CSS](https://tailwindcss.com) za skvělý CSS framework

## 📞 Podpora

Pokud máte problémy nebo otázky:
- Pošlete email na matyaskozubik2@icloud.com

---

**Užijte si kreslení a hádání!** 🎨✨
