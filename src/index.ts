import discord, {
    ButtonInteraction, CacheType, EmbedBuilder,
} from "discord.js"
import process from "process"
import dotenv from "dotenv-safe"

import {InteractionCommand, listCommands} from "./utils/discord/commandHandler"
import deployCommands from "./utils/discord/deployCommands"
import {listButtons} from "./utils/discord/buttonHandler";
import mongoose from "mongoose";
import levelScheme from "./schemes/levelScheme";

process.on('uncaughtException', (err) => {
    console.error(err)
})
dotenv.config()
mongoose.connect(process.env.MONGO_URL as string);

const commands = new Map<string, (interaction: InteractionCommand) => void>;
const buttons = new Map<string, (interaction: ButtonInteraction<CacheType>) => void>;
const client = new discord.Client({
    intents: ["Guilds", "GuildMessages"],
})
client.on("ready", async () => {

    const commandList = (await listCommands()).map(command => command.default)
    const buttonList = (await listButtons()).map(button => button.default)

    // Initialize commands
    for (let command of commandList) {
        commands.set(command.name, command.run)
    }

    // Initialize buttons
    for (let button of buttonList) {
        buttons.set(button.name, button.run)
    }

    // Deploy commands
    await deployCommands(commandList, client, [])
})

client.on('interactionCreate', async (interaction) => {
    // Check if the interaction is a command
    if (interaction.isChatInputCommand()) {
        const {commandName} = interaction
        const commandFunction = commands.get(commandName)
        if (commandFunction !== undefined) {
            commandFunction(interaction)
        }
    }

    // Check if the interaction is a button click
    if (interaction.isButton()) {
        const {customId} = interaction
        const buttonFunction = buttons.get(customId)
        if (buttonFunction !== undefined) {
            buttonFunction(interaction)
        }
    }

})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await handleLevel(message)
})

async function handleLevel(message: discord.Message) {
    if (message.guild === null) return;
    const guildID = message.guild.id
    const userID = message.author.id
    const userData = await levelScheme.findOne({guildID, userID}).exec()
    const rewardXP = Math.floor(Math.random() * 10) + 1 // Random XP between 1 and 10
    if (userData === null) { // Check if user has no recorded messages in the guild
        const newUserData = new levelScheme({
            guildID,
            userID,
            xp: rewardXP,
        })
        await newUserData.save()
    } else {
        // Increase user xp using a random number between 1 and 10 and using $inc operator
        await userData.updateOne({$inc: {xp: rewardXP}}).exec()
    }
    const userXP = (userData?.xp || 0) + rewardXP
    // Calculate level of the user for level rewards
    // Every level needs level*level*10 xp for example level 2 needs 2*2*10 = 40 xp
    const userLevelBeforeMessage = Math.floor(Math.sqrt((userXP - rewardXP) * 0.1))
    const userLevelAfterMessage = Math.floor(Math.sqrt(userXP * 0.1))
    if (userLevelBeforeMessage !== userLevelAfterMessage) {
        const levelUpEmbed = new EmbedBuilder()
            .setTitle("Level up!")
            .setDescription(`You are now level ${userLevelAfterMessage}`)
            .setColor("Green")
        await message.reply({embeds: [levelUpEmbed]})
    }
}

client.login(process.env.TOKEN as string)