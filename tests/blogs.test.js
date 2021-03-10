const Page = require('./helpers/page');
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('when logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleErr = await page.getContentsOf('.title .red-text');
            const contentErr = await page.getContentsOf('.content .red-text');
            const expectedErrText = 'You must provide a value';
            expect(titleErr).toEqual(expectedErrText);
            expect(contentErr).toEqual(expectedErrText);
        });
    });

    describe('using valid inputs', async () => {
        const blogTitle = 'blog title';
        const blogContent = 'blog content';

        beforeEach(async () => {
            await page.type('.title input', blogTitle);
            await page.type('.content input', blogContent);
            await page.click('form button');
        });

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('submitting and saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual(blogTitle);
            expect(content).toEqual(blogContent);
        });
    });
});

describe.only('when not logged in', async () => {
    const path = '/api/blogs';
    const actions = [
        {
            method: 'get',
            path,
        },
        {
            method: 'post',
            path,
            data: {
                title: 'T',
                content: 'C',
            },
        },
    ];

    test.only('cannot see actions', async () => {
        const results = await page.execRequests(actions);

        results.forEach((result) => {
            expect(result).toEqual({ error: 'You must log in!' });
        });
    });
});
