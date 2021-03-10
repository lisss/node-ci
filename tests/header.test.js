const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('check logo', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('check oauth', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

test('has logout link', async () => {
    await page.login();
    const logoutLinkText = await page.getContentsOf('a[href="/auth/logout"]');
    expect(logoutLinkText).toEqual('Logout');
});
