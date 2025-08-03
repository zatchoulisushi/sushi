# Guide de Contribution - Osushi

Merci de votre intérêt pour contribuer au projet Osushi ! Ce guide vous aidera à comprendre comment participer efficacement au développement.

## 🚀 Démarrage rapide

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Installer** les dépendances : `npm install`
4. **Créer** une branche feature : `git checkout -b feature/ma-fonctionnalite`
5. **Développer** votre fonctionnalité
6. **Tester** : `npm run test && npm run lint`
7. **Committer** et **pousser** vos changements
8. **Créer** une Pull Request

## 📋 Standards de code

### Convention de nommage

- **Fichiers** : kebab-case (`product-card.astro`)
- **Composants** : PascalCase (`ProductCard`)
- **Variables** : camelCase (`currentUser`)
- **Constants** : UPPER_SNAKE_CASE (`API_BASE_URL`)

### Structure des commits

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description courte

Description plus détaillée si nécessaire

- Bullet point 1
- Bullet point 2

Fixes #123
```

**Types de commits :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (sans changement logique)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

**Exemples :**
```bash
feat(auth): ajouter connexion avec Google
fix(cart): corriger calcul du total avec remise
docs(readme): mettre à jour guide d'installation
test(products): ajouter tests pour ProductService
```

### Code TypeScript

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

async function getUser(id: string): Promise<User | null> {
  try {
    return await AuthService.getUser(id);
  } catch (error) {
    logger.error('Failed to get user', { id, error });
    return null;
  }
}

// ❌ Éviter
function getUser(id: any): any {
  return AuthService.getUser(id);
}
```

### Composants Astro

```astro
---
// Props typées
interface Props {
  title: string;
  description?: string;
  imageUrl?: string;
}

const { title, description, imageUrl } = Astro.props;
---

<article class="product-card">
  {imageUrl && (
    <img src={imageUrl} alt={title} loading="lazy" />
  )}
  <div class="product-info">
    <h3>{title}</h3>
    {description && <p>{description}</p>}
  </div>
</article>

<style>
  .product-card {
    @apply bg-white rounded-lg shadow-md overflow-hidden;
  }
  
  .product-info {
    @apply p-4;
  }
</style>
```

## 🧪 Tests

### Tests unitaires requis

Tous les services doivent avoir des tests :

```typescript
// src/test/mon-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MonService } from '../lib/mon-service';

describe('MonService', () => {
  it('should do something', () => {
    // Test logic
    expect(MonService.doSomething()).toBe(expectedResult);
  });
});
```

### Tests E2E pour les fonctionnalités utilisateur

```typescript
// tests/e2e/ma-fonctionnalite.spec.ts
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  // Test logic
});
```

## 🎨 Design et UX

### Système de design

- **Couleurs** : Utiliser les variables CSS définies dans `tailwind.config.mjs`
- **Typography** : Système cohérent avec les classes Tailwind
- **Espacement** : Multiples de 4px (Tailwind spacing scale)
- **Responsive** : Mobile-first approach

### Accessibilité

- **Contraste** : Minimum WCAG AA (4.5:1)
- **Navigation clavier** : Tous les éléments interactifs
- **Alt text** : Images descriptives
- **Semantic HTML** : Utiliser les bonnes balises

```astro
<!-- ✅ Bon -->
<button 
  type="button" 
  aria-label="Ajouter au panier"
  class="btn-primary"
>
  <span aria-hidden="true">🛒</span>
  Ajouter
</button>

<!-- ❌ Éviter -->
<div onclick="addToCart()">🛒</div>
```

## 🔄 Workflow de développement

### Branches

- `main` : Code de production
- `develop` : Intégration continue
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- `hotfix/nom-hotfix` : Corrections urgentes

### Pull Requests

#### Template de PR

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] 🎨 Amélioration UI/UX

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour
- [ ] Tests manuels effectués

## Checklist
- [ ] Code suit les standards du projet
- [ ] Auto-review effectuée
- [ ] Documentation mise à jour
- [ ] Aucun warning de build

## Screenshots (si applicable)
[Ajouter des captures d'écran]

Fixes #[numéro-issue]
```

#### Processus de review

1. **Auto-review** : Relire son propre code
2. **CI/CD** : Tous les tests doivent passer
3. **Review** : Au moins 1 approbation requise
4. **Tests** : Fonctionnalités testées manuellement
5. **Merge** : Squash & merge vers develop

## 🐛 Rapports de bugs

### Template d'issue

```markdown
## Description du bug
Description claire du problème

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '....'
3. Faire défiler vers '....'
4. Voir l'erreur

## Comportement attendu
Ce qui devrait se passer

## Comportement actuel
Ce qui se passe réellement

## Screenshots
[Ajouter des captures d'écran]

## Environnement
- OS: [e.g. macOS 12.1]
- Navigateur: [e.g. Chrome 96]
- Node.js: [e.g. 18.12.0]

## Logs/Erreurs
```
[Coller les logs d'erreur]
```

## Informations supplémentaires
Tout autre contexte utile
```

## 💡 Propositions de fonctionnalités

### Template de feature request

```markdown
## Résumé de la fonctionnalité
Description en une phrase

## Problème à résoudre
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Description détaillée de la solution

## Alternatives considérées
Autres approches envisagées

## Impact
- Performance: [Impact estimé]
- UX: [Amélioration utilisateur]
- Technique: [Complexité de mise en œuvre]

## Maquettes/Screenshots
[Si applicable]
```

## 🔧 Configuration de développement

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

### Configuration Prettier

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  }
}
```

## 📊 Métriques de qualité

### Objectifs

- **Couverture de tests** : > 80%
- **Performance Lighthouse** : > 90
- **Accessibilité** : 100%
- **SEO** : > 95

### Monitoring

- Vérifier les métriques avant chaque PR
- Surveiller les régressions de performance
- Auditer l'accessibilité régulièrement

## 🤝 Communauté

### Communication

- **Issues GitHub** : Bugs et features
- **Discussions** : Questions générales
- **PR Reviews** : Feedback constructif

### Code de conduite

- Respectueux et inclusif
- Feedback constructif
- Patience avec les nouveaux contributeurs

## 📚 Ressources utiles

- [Documentation Astro](https://docs.astro.build/)
- [Guide TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Merci de contribuer à Osushi ! 🍣