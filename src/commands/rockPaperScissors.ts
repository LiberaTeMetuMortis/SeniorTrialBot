import Command from "../utils/discord/commandHandler";
import { EmbedBuilder } from "discord.js";
export default new Command({
    name: "rock-paper-scissors",
    description: "Play rock paper scissors with the bot",
    permissions: [],
    options: [{
        name: "choice",
        description: "Your choice",
        type: "string"
    }],
    async run(interaction) {
        const allChoices = ["rock", "paper", "scissors"];
        const selectedChoice = interaction.options.get("choice", true).value as string;
        if(allChoices.includes(selectedChoice.toLowerCase())) {
            console.log("It includes the choice")
            const botChoice = allChoices[Math.floor(Math.random() * allChoices.length)];
            const result = getResult(selectedChoice.toLowerCase(), botChoice);
            const resultEmbed = new EmbedBuilder()
                .setTitle("Rock paper scissors")
                .setDescription(`You chose ${selectedChoice.toLowerCase()}, I chose ${botChoice}. ${result}`)
                .setColor("Green")
            interaction.reply({embeds: [resultEmbed]});
        }
        else {
            console.log("It doesn't include the choice")
            const invalidChoiceEmbed = new EmbedBuilder()
                .setTitle("Invalid choice")
                .setDescription("You must choose between rock, paper and scissors")
                .setColor("Red")
            interaction.reply({embeds: [invalidChoiceEmbed]});
        }
    }
})

function getResult(userChoice: string, botChoice: string) {
    if(userChoice === botChoice) return "It's a tie!";
    else if(
        (userChoice === "rock" && botChoice === "scissors") || 
        (userChoice === "paper" && botChoice === "rock") || 
        (userChoice === "scissors" && botChoice === "paper")) return "You won!";
    else return "You lost!";
}