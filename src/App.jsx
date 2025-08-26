import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

// Available sprites for random selection
// https://github.com/PokeAPI/sprites/tree/master/sprites
const AVAILABLE_SPRITES = [
  '149.gif',
  '163.gif',
  '175.gif',
  '242.gif',
  'master-ball.png',
  'razz-berry.png',
  'heal-ball.png'
]

// Separate BountyModal component to prevent re-renders
const BountyModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialImage, 
  initialText, 
  initialDuration,
  initialInterval
}) => {
  const [localState, setLocalState] = useState({
    image: initialImage,
    text: initialText,
    duration: initialDuration,
    interval: initialInterval
  })

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalState({
        image: initialImage,
        text: initialText,
        duration: initialDuration,
        interval: initialInterval
      })
    }
  }, [isOpen, initialImage, initialText, initialDuration, initialInterval])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLocalState(prev => ({
          ...prev,
          image: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSave = useCallback(() => {
    onSave(localState)
  }, [localState, onSave])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-1/4 min-w-[300px] bg-gradient-to-br from-purple-900/90 to-purple-700/90 rounded-xl p-6 shadow-xl border border-purple-500/30"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Bounty Settings</h2>
        
        <div className="mb-4">
          <label className="block text-white mb-2">Bounty Image</label>
          <div className="h-40 bg-purple-800/50 rounded-lg overflow-hidden">
            {localState.image ? (
              <div className="relative w-full h-full group">
                <img 
                  src={localState.image} 
                  alt="Bounty Preview" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer text-white hover:text-purple-300 transition-colors">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-purple-700/50 transition-colors">
                <span className="text-white">Click to Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Bounty Text</label>
          <input
            type="text"
            value={localState.text}
            onChange={(e) => setLocalState(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-3 py-2 bg-purple-800/50 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter text (e.g., 0/2)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Display Duration (seconds)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={localState.duration}
              onChange={(e) => setLocalState(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="flex-1 h-2 bg-purple-800/50 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white w-8 text-center">{localState.duration}s</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2">Display Interval (seconds)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="30"
              value={localState.interval}
              onChange={(e) => setLocalState(prev => ({ ...prev, interval: Number(e.target.value) }))}
              className="flex-1 h-2 bg-purple-800/50 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white w-8 text-center">{localState.interval}s</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-800/50 text-white rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function App() {
  const [bagCount, setBagCount] = useState(50)
  const [chaseCount, setChaseCount] = useState(8)
  const [prizeImage, setPrizeImage] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [spriteActive, setSpriteActive] = useState(false)
  const [currentSprite, setCurrentSprite] = useState(AVAILABLE_SPRITES[0])
  const [showBountyModal, setShowBountyModal] = useState(false)
  const [bountyImage, setBountyImage] = useState(null)
  const [bountyText, setBountyText] = useState('')
  const [bountyDuration, setBountyDuration] = useState(5)
  const [bountyInterval, setBountyInterval] = useState(10)
  const [bountyActive, setBountyActive] = useState(false)
  const [showBounty, setShowBounty] = useState(false)
  
  const controlsTimeout = useRef(null)
  const animationFrameId = useRef(null)
  const bountyIntervalRef = useRef(null)
  const bountyTimeout = useRef(null)
  const spriteRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    dx: 5,
    dy: 5,
    rotation: 0
  })

  const calculateHitRatio = () => {
    if (bagCount === 0) return '0%'
    const ratio = (chaseCount / bagCount) * 100
    return `${ratio.toFixed(1)}%`
  }

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPrizeImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const toggleSprite = useCallback(() => {
    if (!spriteActive) {
      // Select a random sprite when activating
      const randomSprite = AVAILABLE_SPRITES[Math.floor(Math.random() * AVAILABLE_SPRITES.length)]
      setCurrentSprite(randomSprite)
    }
    setSpriteActive(!spriteActive)
  }, [spriteActive])

  const startBounty = useCallback(() => {
    if (bountyIntervalRef.current) {
      clearInterval(bountyIntervalRef.current)
    }
    if (bountyTimeout.current) {
      clearTimeout(bountyTimeout.current)
    }

    setBountyActive(true)
    setShowBounty(true)
    
    bountyTimeout.current = setTimeout(() => {
      setShowBounty(false)
    }, bountyDuration * 1000)

    bountyIntervalRef.current = setInterval(() => {
      setShowBounty(true)
      bountyTimeout.current = setTimeout(() => {
        setShowBounty(false)
      }, bountyDuration * 1000)
    }, bountyInterval * 1000)
  }, [bountyDuration, bountyInterval])

  const stopBounty = useCallback(() => {
    setBountyActive(false)
    if (bountyIntervalRef.current) {
      clearInterval(bountyIntervalRef.current)
    }
    if (bountyTimeout.current) {
      clearTimeout(bountyTimeout.current)
    }
    setShowBounty(false)
  }, [])

  const handleBountySave = useCallback((settings) => {
    const wasActive = bountyActive
    if (wasActive) {
      stopBounty()
    }
    
    setBountyImage(settings.image)
    setBountyText(settings.text)
    setBountyDuration(settings.duration)
    setBountyInterval(settings.interval)
    setShowBountyModal(false)

    if (wasActive) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        startBounty()
      }, 100)
    }
  }, [bountyActive, stopBounty, startBounty])

  // Handle mouse movement to show controls
  useEffect(() => {
    const handleInteraction = () => {
      setShowControls(true)
      clearTimeout(controlsTimeout.current)
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      clearTimeout(controlsTimeout.current)
    }
  }, [])

  // Sprite animation
  useEffect(() => {
    if (!spriteActive || showBountyModal) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      return
    }

    const animate = () => {
      const sprite = spriteRef.current
      
      // Update position
      sprite.x += sprite.dx
      sprite.y += sprite.dy
      
      // Bounce off walls
      if (sprite.x <= 0 || sprite.x >= window.innerWidth - 100) {
        sprite.dx *= -1
        sprite.rotation = Math.random() * 360
      }
      if (sprite.y <= 0 || sprite.y >= window.innerHeight - 100) {
        sprite.dy *= -1
        sprite.rotation = Math.random() * 360
      }

      // Random direction changes
      if (Math.random() < 0.02) {
        sprite.dx = (Math.random() - 0.5) * 10
        sprite.dy = (Math.random() - 0.5) * 10
      }

      // Update DOM element
      const spriteElement = document.getElementById('bouncing-sprite')
      if (spriteElement) {
        spriteElement.style.transform = `translate(${sprite.x}px, ${sprite.y}px) rotate(${sprite.rotation}deg)`
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [spriteActive, showBountyModal])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (bountyIntervalRef.current) {
        clearInterval(bountyIntervalRef.current)
      }
      if (bountyTimeout.current) {
        clearTimeout(bountyTimeout.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Pulsating background */}
      <motion.div
        className="fixed inset-0 z-0"
        animate={{
          background: [
            'linear-gradient(to right, #2a0845, #6441A5)',
            'linear-gradient(to right, #6441A5, #2a0845)',
            'linear-gradient(to right, #2a0845, #6441A5)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm z-40"
            >
              <div className="max-w-7xl mx-auto flex flex-col gap-4">
                {/* Top row: Bags, Sprite Toggle, Chases */}
                <div className="flex items-center justify-between gap-4">
                  {/* Bag controls */}
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setBagCount(Math.max(0, bagCount - 1))}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl backdrop-blur-sm pointer-events-auto"
                    >
                      ←
                    </motion.button>
                    
                    <div className="w-24 text-center">
                      <div className="text-3xl font-bold text-white">{bagCount}</div>
                      <div className="text-sm text-white/80">Bags</div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setBagCount(bagCount + 1)}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl backdrop-blur-sm pointer-events-auto"
                    >
                      →
                    </motion.button>
                  </div>

                  {/* Sprite toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSprite}
                    className={`w-20 h-20 rounded-full overflow-hidden pointer-events-auto ${
                      spriteActive ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                    }`}
                  >
                    <img 
                      src="/384.gif" // Rayquaza sprite as default
                      alt="Toggle Sprite"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '🎮'
                      }}
                    />
                  </motion.button>

                  {/* Chase controls */}
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setChaseCount(Math.max(0, chaseCount - 1))}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl backdrop-blur-sm pointer-events-auto"
                    >
                      ←
                    </motion.button>
                    
                    <div className="w-24 text-center">
                      <div className="text-3xl font-bold text-white">{chaseCount}</div>
                      <div className="text-sm text-white/80">Chases</div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setChaseCount(chaseCount + 1)}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl backdrop-blur-sm pointer-events-auto"
                    >
                      →
                    </motion.button>
                  </div>
                </div>

                {/* Bottom row: Bounty controls */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowBountyModal(true)}
                    className="px-6 py-3 bg-purple-600/60 text-white rounded-lg hover:bg-purple-500/60 transition-colors pointer-events-auto"
                  >
                    {bountyImage ? 'Modify Bounty' : 'Add Bounty'}
                  </motion.button>

                  {bountyImage && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => bountyActive ? stopBounty() : startBounty()}
                      className={`px-6 py-3 ${
                        bountyActive ? 'bg-green-600/60' : 'bg-purple-600/60'
                      } text-white rounded-lg transition-colors pointer-events-auto`}
                    >
                      {bountyActive ? 'Stop Bounty' : 'Start Bounty'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centered hit ratio (only shown when image is uploaded and bounty is not showing) */}
        <AnimatePresence>
          {prizeImage && !showBounty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className="px-6 py-3 bg-black/50 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                  {bagCount} Bags / Hit Ratio: {calculateHitRatio()}
                </h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouncing Sprite */}
        {spriteActive && !showBountyModal && (
          <motion.div
            id="bouncing-sprite"
            className="fixed z-20 w-20 h-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <img 
              src={currentSprite}
              alt="Bouncing Sprite"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '🎮'
              }}
            />
          </motion.div>
        )}

        {/* Bounty Display */}
        <AnimatePresence>
          {showBounty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/70 backdrop-blur-sm p-6 rounded-xl">
                {bountyImage && (
                  <img 
                    src={bountyImage} 
                    alt="Bounty" 
                    className="max-w-md max-h-96 object-contain mb-4"
                  />
                )}
                {bountyText && (
                  <div className="text-3xl font-bold text-white text-center">
                    {bountyText}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bounty Modal */}
        <AnimatePresence>
          {showBountyModal && (
            <BountyModal
              isOpen={showBountyModal}
              onClose={() => setShowBountyModal(false)}
              onSave={handleBountySave}
              initialImage={bountyImage}
              initialText={bountyText}
              initialDuration={bountyDuration}
              initialInterval={bountyInterval}
            />
          )}
        </AnimatePresence>

        {/* Image display with zoom */}
        <div className="h-screen w-full">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            doubleClick={{ mode: "reset" }}
          >
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              <motion.div
                className="w-full h-full"
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #6441A5, #2a0845, #6441A5)',
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {prizeImage ? (
                  <img
                    src={prizeImage}
                    alt="Prize"
                    className="w-full h-full object-contain bg-gray-900"
                    draggable="false"
                  />
                ) : (
                  <label className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer hover:bg-gray-800 transition-colors">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <div className="text-white text-lg">Click to Upload Image</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </motion.div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Ask me what is LIVE text */}
        <motion.div
          className="fixed bottom-4 left-4 z-40"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
            <p className="text-white text-lg">Ask me what is LIVE</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;