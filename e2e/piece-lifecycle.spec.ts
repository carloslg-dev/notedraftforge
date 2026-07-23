import { test, expect } from '@playwright/test';

test.describe('Piece Lifecycle E2E', () => {
  test('creates a piece, views it, and edits its content', async ({ page }) => {
    // Fail the test if there are any uncaught exceptions or runtime errors in the browser console
    page.on('pageerror', (exception) => {
      throw new Error(`Uncaught browser exception: ${exception.stack || exception.message}`);
    });

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

    // 5. Verify we are already in editing mode after creation
    await expect(page.locator('.editing-view')).toBeVisible();

    // Clear content and write new structured content in Tiptap
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Hello, this is persistent E2E text!');

    // Wait 1.5 seconds to trigger the 800ms debounce autosave and let state refresh
    await page.waitForTimeout(1500);

    // Click "Finish Editing" or "Terminar Edición" to switch back to visualization mode
    const finishBtn = page.locator('button:has-text("Terminar Edición"), button:has-text("Finish Editing")').first();
    await finishBtn.click();

    // Verify redirect/transition to visualization mode is finished and content is visible
    await expect(page.locator('.visualization-view')).toBeVisible();
    await expect(page.locator('.visualization-view')).toContainText('Hello, this is persistent E2E text!');

    // Double click word in visualization mode to trigger annotation toolbar
    const vizParagraph = page.locator('.visualization-view span').first();
    await vizParagraph.dblclick();

    // Verify visualization selection toolbar is visible with annotation kinds + Refine
    const vizToolbar = page.locator('.visualization-selection-toolbar');
    await expect(vizToolbar.locator('button[title="Intención"], button[title="Intent"]')).toBeVisible();
    await expect(vizToolbar.locator('button[title="Comentario"], button[title="Comment"]')).toBeVisible();
    await expect(vizToolbar.locator('button[title="Respiración"], button[title="Breath"]')).toBeVisible();

    const refineBtnViz = vizToolbar.locator('button:has-text("Ajustar"), button:has-text("Refine")').first();
    await expect(refineBtnViz).toBeVisible();

    // Open refinement modal from visualization view selection toolbar
    await refineBtnViz.click();
    
    const modalHeading = page.locator('h2:has-text("Ajustar Selección"), h2:has-text("Refine Selection")');
    await expect(modalHeading).toBeVisible();

    // Close the modal
    const cancelBtn = page.locator('button:has-text("Cancelar"), button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(modalHeading).not.toBeVisible();

    // 6. Enter editing mode manually from visualization mode
    const editBtn = page.locator('button:has-text("Editar"), button:has-text("Edit Piece")').first();
    await editBtn.click();

    // Verify we are back in editing mode
    await expect(page.locator('.editing-view')).toBeVisible();

    // Select text in editor to trigger formatting BubbleMenu via Shift+Arrow selection
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.down('Shift');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');

    // Verify editing mode BubbleMenu shows formatting options + Refine
    const bubbleMenu = page.locator('.editor-bubble-menu');
    await expect(bubbleMenu.locator('button[title="Bold"]')).toBeVisible();
    await expect(bubbleMenu.locator('button[title="Italic"]')).toBeVisible();
    await expect(bubbleMenu.locator('button[title="Underline"]')).toBeVisible();
    
    const refineBtnEdit = bubbleMenu.locator('button:has-text("Ajustar"), button:has-text("Refine")').first();
    await expect(refineBtnEdit).toBeVisible();

    // Click Refine button in BubbleMenu
    await refineBtnEdit.click();
    await expect(modalHeading).toBeVisible();

    // Nudge start right inside the modal
    const nudgeStartRight = page.locator('.bg-card').locator('button:has-text("→")').first();
    await nudgeStartRight.click();

    // Confirm refinement
    const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Confirm")').first();
    await confirmBtn.click();

    // Verify modal is closed
    await expect(modalHeading).not.toBeVisible();

    // Click Finish Editing to return to visualization mode
    await finishBtn.click();
    await expect(page.locator('.visualization-view')).toBeVisible();

    // 7. Go back to main list
    const backBtn = page.locator('button:has-text("Obras"), button:has-text("Works")').first();
    await backBtn.click();

    // Verify redirect to list
    await expect(page).toHaveURL(/\/$/);

    // 8. Verify the new piece appears in the list and preview pane displays the typed text
    const pieceListItem = page.locator('button:has-text("E2E Test Piece"), a:has-text("E2E Test Piece")').first();
    await expect(pieceListItem).toBeVisible();
    await pieceListItem.click();

    // Verify the preview pane (on desktop) shows the edited text
    await expect(page.locator('main')).toContainText('Hello, this is persistent E2E text!');
  });
});
