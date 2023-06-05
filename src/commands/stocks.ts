import { EmbedBuilder } from "discord.js";
import Command from "../utils/discord/commandHandler";
export default new Command({
    name: "stocks",
    description: "Get the current price of a stock",
    permissions: [],
    options: [{
        name: "symbol",
        description: "The symbol of the stock",
        type: "string",

    }],
    async run(interaction) {
        const symbol = interaction.options.get("symbol", true).value as string;

        // Doing url stuff, I could do it with string literals but this is more readable
        const url = new URL("https://www.alphavantage.co/query")
        url.searchParams.append("function", "GLOBAL_QUOTE")
        url.searchParams.append("symbol", symbol)
        url.searchParams.append("apikey", process.env.ALPHA_VANTAGE_API_KEY as string)

        const request = await fetch(url)
        const responseJSON = await request.json()

        const globalQuote = responseJSON["Global Quote"]
            

        if(globalQuote === undefined || Object.keys(globalQuote).length === 0) { // Check if the object is empty
            const invalidSymbolEmbed = new EmbedBuilder()
                .setTitle("Invalid symbol")
                .setDescription(`The symbol ${symbol} is invalid`)
                .setColor("Red")
            interaction.reply({embeds: [invalidSymbolEmbed]});
            return
        }

        const price = globalQuote["05. price"]
        const priceEmbed = new EmbedBuilder()
            .setTitle(`Price of ${symbol}`)
            .setDescription(`The price of ${symbol} is ${price}$`)
            .setColor("Green")
        interaction.reply({embeds: [priceEmbed]});
        console.log(`Retrieved data:`, responseJSON)
    }
})