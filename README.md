### Shoda se zadáním (70 b)

| Požadavek | Implementace |
|-----------|--------------|
| Unikátní username | index + unique v User Schema |
| Hashované heslo | bcryptjs (12 salt rounds) |
| Souhlas s AI | checkbox → **aiConsent** true |
| Vložení, mazání, výpis, important | CRUD + flag + filter `?important=true` |
| Chronologické řazení | `.sort({ createdAt: -1 })` |
| Zrušení účtu + mazání poznámek | `DELETE /api/user/account` |
# maturita_hlavacek
Příprava na maturitní zadání
