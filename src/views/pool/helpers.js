export const getPoolBlockInfo = (pool, currentBlock) => {
    const { startBlock, endBlock, isFinished } = pool
    const shouldShowBlockCountdown = Boolean(!isFinished && startBlock && endBlock)
    const blocksUntilStart = Math.max(startBlock - currentBlock, 0)
    const blocksRemaining = Math.max(endBlock - currentBlock, 0)
    const hasPoolStarted = blocksUntilStart === 0 && blocksRemaining > 0
    const blocksToDisplay = hasPoolStarted ? blocksRemaining : blocksUntilStart
    return { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay }
}