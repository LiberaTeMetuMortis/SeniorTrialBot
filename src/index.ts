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
import dailyMessageScheme from "./schemes/dailyMessageScheme"
import handleLevel from "./functions/handleLevel"
import startDailyMessageInterval from "./functions/startDailyMessageInterval"

process.on('uncaughtException', (err) => {
    console.error(err)
})
dotenv.config()
mongoose.connect(process.env.MONGO_URL as string);

const commands = new Map<string, (interaction: InteractionCommand) => void>;
const buttons = new Map<string, (interaction: ButtonInteraction<CacheType>) => void>;
const client = new discord.Client({
    intents: ["Guilds", "GuildMessages"]
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

    // Start daily messages
    const dailyMessages = await dailyMessageScheme.find()
    for (const dailyMessage of dailyMessages) {
        await startDailyMessageInterval(client, dailyMessage.guildID!, dailyMessage.channelID!, { message: dailyMessage.message!, hour: dailyMessage.hour!, minute: dailyMessage.minute! })
    }
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

client.on('guildMemberAdd', (member) => { 
    const welcomeEmbed = new EmbedBuilder()
        .setTitle("Welcome!")
        .setDescription(`Welcome to the server ${member.user.username}`)
        .setColor("Green")
    member.guild.systemChannel?.send({embeds: [welcomeEmbed]})
})




client.login(process.env.TOKEN as string)

