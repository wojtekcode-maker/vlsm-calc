export const handlebarsHelpers = {
    times: (n: number, block: any) => {
        let accum = '';
        for (let i = 1; i <= n; ++i) {
            accum += block.fn(i);
        }
        return accum;
    }
}