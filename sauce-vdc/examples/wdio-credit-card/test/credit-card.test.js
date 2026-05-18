describe('Credit Card Payment Flow', () => {
    it('should complete the credit card form and confirm submission', async () => {
        await browser.url('https://fill.dev/form/credit-card-simple');

        await $('#cc-name').setValue('James Bond');
        await $('#cc-type').selectByAttribute('value', 'visa');
        await $('#cc-number').setValue('4111111111111111');
        await $('#cc-csc').setValue('123');
        await $('#cc-exp-month').selectByAttribute('value', '1');
        await $('#cc-exp-year').selectByAttribute('value', '2028');

        await $('button[type="submit"]').click();

        // Form submits to fill.dev/submit — navigation there confirms successful submission
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/submit'),
            { timeout: 15000, timeoutMsg: 'Expected navigation to the Form Submit Results page' }
        );
    });
});
