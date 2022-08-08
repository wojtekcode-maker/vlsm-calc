export const handlebarsHelpers = {
    times: (n: number, block: any) => {
        let accum = '';
        for (let i = 1; i <= n; ++i) {
            accum += block.fn(i);
        }
        return accum;
    },

    dotted: (address: Array<number>, lastNumber: number) => {
        if (typeof lastNumber === 'number'){
            address[3] += lastNumber;
        }
        return address.reduce((prev: string, curr: number) => {
            return `${prev}.${curr}`;
        }, '').slice(1);
    }
}