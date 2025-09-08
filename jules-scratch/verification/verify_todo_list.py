from playwright.sync_api import sync_playwright, Page, expect, TimeoutError

def run_verification(page: Page):
    """
    This script verifies the To Do List functionality.
    """
    # 1. Navigate to the app
    page.goto("http://127.0.0.1:8080/")
    page.wait_for_load_state("networkidle")

    # 2. Click on the "Lista Spesa" (To Do List) tab
    try:
        todo_list_tab = page.get_by_role("tab", name="Lista Spesa")
        todo_list_tab.wait_for(state="visible", timeout=10000)
        todo_list_tab.click()
    except Exception:
        print("Could not find the 'Lista Spesa' tab. Page content:")
        print(page.content())
        raise

    # 3. Add a new item
    name_input = page.get_by_label("Nome")
    person_select_trigger = page.get_by_role("combobox")
    add_button = page.get_by_role("button", name="Aggiungi")

    expect(name_input).to_be_visible()
    expect(person_select_trigger).to_be_visible()
    expect(add_button).to_be_visible()

    name_input.fill("Caffè")
    person_select_trigger.click()
    page.screenshot(path="jules-scratch/verification/00_select_clicked.png")


    marco_option = page.get_by_role("option", name="Marco")
    marco_option.wait_for(state="visible", timeout=5000)
    marco_option.click(force=True)

    expect(person_select_trigger).to_have_text("Marco")

    add_button.click()

    # Wait a bit for KV to update
    page.wait_for_timeout(2000)

    # 4. Verify the item was added and take a screenshot
    new_item = page.get_by_label("Caffè - Marco")
    expect(new_item).to_be_visible()
    page.screenshot(path="jules-scratch/verification/01_item_added.png")

    # 5. Delete the item
    new_item_checkbox = new_item.locator("input[type=checkbox]")
    new_item_checkbox.click()

    # Wait a bit for KV to update
    page.wait_for_timeout(2000)

    # 6. Verify the item was deleted and take a screenshot
    expect(new_item).not_to_be_visible()
    page.screenshot(path="jules-scratch/verification/02_item_deleted.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()
