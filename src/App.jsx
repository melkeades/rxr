import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { XRCanvas, PointerHand, PointerController } from '@coconut-xr/natuerlich/defaults'
import { RootText, clippingEvents } from '@coconut-xr/koestlich'
import { getInputSourceId } from '@coconut-xr/natuerlich'
import { useSessionSupported } from '@coconut-xr/natuerlich/react'
import { XWebPointers } from '@coconut-xr/xinteraction/react'
import { useEnterXR, NonImmersiveCamera, ImmersiveSessionOrigin, useInputSources, XR, useXR } from '@coconut-xr/natuerlich/react'
import { useEffect, useState, useRef, useCallback } from 'react'
import Glass from './Glass'
import Hud from './Hud'
import Dome from './Dome'

const sel = (e) => document.querySelector(e)

const mediaPath = '/360/'
const mediaDb = [
  { type: 'video', src: 'w5.mp4', thumb: 'w5.jpg', name: 'Moment Name a' },
  { type: 'video', src: 'w6.mp4', thumb: 'w6.jpg', name: 'Moment Name a' },
  { type: 'image', src: 'w1.webp', thumb: '', name: 'Moment Name b' },
  { type: 'image', src: 'w2.webp', thumb: '', name: 'Moment Name b' },
  { type: 'image', src: 'w3.webp', thumb: '', name: 'Moment Name c' },
  { type: 'image', src: 'w4.webp', thumb: '', name: 'Moment Name c' },
]

const sessionOptions = {
  requiredFeatures: ['local-floor'],
}

export default function Index() {
  const enterAR = useEnterXR('immersive-vr', sessionOptions)
  const inputSources = useInputSources()

  const [orbitControl, setOrbitControl] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(2)

  const btnPrev$ = sel('.btn--prev')
  const btnNext$ = sel('.btn--next')

  const handlerPrev = useCallback(() => {
    setPhotoIndex(photoIndex > 0 ? photoIndex - 1 : mediaDb.length - 1)
  })
  const handlerNext = useCallback(() => {
    setPhotoIndex(photoIndex < mediaDb.length - 1 ? photoIndex + 1 : 0)
  })

  useEffect(() => {
    btnPrev$.addEventListener('click', handlerPrev)
    return () => {
      btnPrev$.removeEventListener('click', handlerPrev)
    }
  }, [handlerPrev, handlerNext])

  useEffect(() => {
    btnNext$.addEventListener('click', handlerNext)
    return () => {
      btnNext$.removeEventListener('click', handlerNext)
    }
  }, [handlerNext, handlerPrev])

  return (
    <>
      {useSessionSupported('immersive-vr') && (
        <button className="btn--xr" onClick={enterAR}>
          Enter VR
        </button>
      )}
      <XRCanvas events={clippingEvents} gl={{ localClippingEnabled: true }}>
        <OrbitControls enableRotate={orbitControl} />
        <ambientLight intensity={0.3} />
        <directionalLight castShadow position={[1, 2, 3]} intensity={2} />
        {inputSources.map((inputSource) =>
          inputSource.hand != null ? (
            <PointerHand
              id={getInputSourceId(inputSource)}
              key={getInputSourceId(inputSource)}
              inputSource={inputSource}
              hand={inputSource.hand}
              childrenAtJoint="wrist"
            ></PointerHand>
          ) : (
            <PointerController id={getInputSourceId(inputSource)} key={getInputSourceId(inputSource)} inputSource={inputSource}></PointerController>
          )
        )}
        <Dome photoIndex={photoIndex} setPhotoIndex={setPhotoIndex} mediaPath={mediaPath} mediaDb={mediaDb} />
        <Hud setPhotoIndex={setPhotoIndex} setOrbitControl={setOrbitControl} mediaPath={mediaPath} mediaDb={mediaDb} />
      </XRCanvas>
    </>
  )
}
