import { test, expect } from '@playwright/test';

test.describe('Piece Lifecycle E2E', () => {
  test('creates a piece, views it, and edits its content', async ({ page }) => {
    // 1. Visit home page
    await page.goto('/');

    // Wait for the works heading or container to appear
    await expect(page.locator('span:has-text("Obras"), span:has-text("Works"), h1:has-text("Works")').first()).toBeVisible();

    // 2. Open the Create modal by clicking the "New work" button (supports desktop icon title and mobile visible text)
    const newWorkButton = page.locator('button[title*="Obra"], button[title*="Work"], button:has-text("Obra"), button:has-text("Work")').first();
    await newWorkButton.click();

    // Scope form selectors to the modal form to prevent matching background elements
    const modalForm = page.locator('form').first();

    // 3. Fill in the modal inputs
    const titleInput = modalForm.locator('input[placeholder*="título"], input[placeholder*="title"]').first();
    await titleInput.fill('E2E Test Piece');
    
    // Choose "poem" type inside the form
    const poemBtn = modalForm.locator('button:has-text("Poema"), button:has-text("Poem")').first();
    await poemBtn.click();

    // Click "Crear" or "Create" inside the form
    const createSubmitBtn = modalForm.locator('button[type="submit"]').first();
    await createSubmitBtn.click();

    // 4. Verify redirect and display in work view page
    await expect(page).toHaveURL(/\/work\/.+/);
    await expect(page.locator('h1')).toContainText('E2E Test Piece');

    // 5. Enter editing mode
    const editBtn = page.locator('button:has-text("Editar"), button:has-text("Edit Piece")').first();
    await editBtn.click();

    // Verify editor container is visible
    await expect(page.locator('.editing-view')).toBeVisible();

    // Clear content and write new structured content in Tiptap
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Hello, this is persistent E2E text!');

    // Wait 1.5 seconds to trigger the 800ms debounce autosave and let state refresh
    await page.waitForTimeout(1500);

    // 6. Go back to main list
    const backBtn = page.locator('button:has-text("Obras"), button:has-text("Works")').first();
    await backBtn.click();

    // Verify redirect to list
    await expect(page).toHaveURL(/\/$/);

    // 7. Verify the new piece appears in the list
    await expect(page.locator('button:has-text("E2E Test Piece"), a:has-text("E2E Test Piece")').first()).toBeVisible();
  });
});
