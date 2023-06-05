import discord from "discord.js"
import levelScheme from "../schemes/levelScheme";
export default async function handleLevel(message: discord.Message) {
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
        const levelUpEmbed = new discord.EmbedBuilder()
            .setTitle("Level up!")
            .setDescription(`You are now level ${userLevelAfterMessage}`)
            .setColor("Green")
        await message.reply({embeds: [levelUpEmbed]})
    }
}