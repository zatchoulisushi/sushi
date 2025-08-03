import { test, expect } from '@playwright/test';

test.describe('Osushi - Site Web', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page d\'accueil se charge correctement', async ({ page }) => {
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Osushi/);
    
    // Vérifier la présence des éléments principaux
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigation principale fonctionne', async ({ page }) => {
    // Tester la navigation vers le menu
    await page.click('a[href="/menu"]');
    await expect(page).toHaveURL(/.*menu/);
    
    // Tester la navigation vers la page commander
    await page.click('a[href="/commander"]');
    await expect(page).toHaveURL(/.*commander/);
    
    // Tester la navigation vers la page fidélité
    await page.click('a[href="/fidelite"]');
    await expect(page).toHaveURL(/.*fidelite/);
  });

  test('menu affiche les catégories et produits', async ({ page }) => {
    await page.goto('/menu');
    
    // Vérifier la présence des catégories
    await expect(page.locator('[data-testid="category"]')).toHaveCount(6, { timeout: 10000 });
    
    // Vérifier qu'il y a des produits affichés
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(15, { timeout: 10000 });
  });

  test('panier fonctionne (ajout/suppression)', async ({ page }) => {
    await page.goto('/menu');
    
    // Attendre que les produits se chargent
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Ajouter un produit au panier
    await page.click('[data-testid="add-to-cart"]:first-child');
    
    // Vérifier que le compteur du panier a augmenté
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Ouvrir le panier
    await page.click('[data-testid="cart-toggle"]');
    
    // Vérifier que le produit est dans le panier
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('formulaire de contact fonctionne', async ({ page }) => {
    await page.goto('/contact');
    
    // Remplir le formulaire
    await page.fill('[name="nom"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="message"]', 'Message de test');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier le message de confirmation
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
  });

  test('page admin nécessite une authentification', async ({ page }) => {
    await page.goto('/admin');
    
    // Devrait rediriger vers la page de connexion ou afficher un message d'erreur
    await expect(page.locator('[data-testid="login-form"], .error-message')).toBeVisible();
  });

  test('responsive design fonctionne', async ({ page }) => {
    // Tester sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Vérifier que le menu mobile est présent
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Vérifier que le contenu est responsive
    await expect(page.locator('main')).toBeVisible();
  });

  test('performance de base', async ({ page }) => {
    // Commencer à mesurer les métriques de performance
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Vérifier que la page se charge en moins de 3 secondes
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Vérifier que les images ont des attributs alt
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('accessibilité de base', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier la navigation au clavier
    await page.keyboard.press('Tab');
    
    // Vérifier que les liens principaux sont focusables
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Vérifier les rôles ARIA
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();
  });
});