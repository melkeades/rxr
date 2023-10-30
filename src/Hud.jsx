import { Suspense, useEffect, useState } from 'react'
import { RootContainer, Container, Image, Text, clippingEvents, noAnimation } from '@coconut-xr/koestlich'
import Glass from './Glass'
import { useThree, useFrame } from '@react-three/fiber'
import { useSpring, a } from '@react-spring/three'
import { useXR, useSessionChange } from '@coconut-xr/natuerlich/react'

export default function Hud({ setOrbitControl, setPhotoIndex, mediaPath, mediaDb }) {
  const [isVr, setIsVr] = useState(false)
  const { gl, camera } = useThree()
  let pre = { position: [0, 0, -20], rotation: [0, 0, 1] }
  let pres = false

  const [props, set] = useSpring(() => ({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    config: { mass: 1, friction: 20, tension: 50 },
  }))
  useEffect(() => {
    setIsVr(!isVr)
  }, [pres])
  let xp, yp, zp, xr, yr, zr
  useSessionChange(() => {
    if (useXR.getState().mode !== 'none' && !isVr) {
      setIsVr(true)
      console.log('ch')
    } else if (useXR.getState().mode === 'none' && isVr) {
      setIsVr(false)
    }
  })
  useFrame(() => {
    const getCamera = camera
    // const getCamera = isPresenting ? gl.xr.getCamera(camera) : camera
    // const getCamera = gl.xr.getCamera(camera)
    const { x, y, z } = getCamera.position
    const { x: rotX, y: rotY, z: rotZ } = getCamera.rotation

    xp = camera.position.x
    yp = camera.position.y
    zp = camera.position.z
    xr = camera.rotation._x
    yr = camera.rotation._y
    zr = camera.rotation._z
    // console.log(gl.xr.getCamera())
    set({ position: [x, y, z], rotation: [rotX, rotY, rotZ] })
  })

  return (
    isVr && (
      <>
        <a.group position={isVr ? [0, 0, -0] : props.position}>
          <a.group rotation={isVr ? [0, 0, 0] : props.rotation}>
            {/* <a.group rotation={(xr, yr, zr)}> */}
            <RootContainer
              position={[0, -1, -3]}
              rotation={[-0.5, 0, 0]}
              sizeX={4}
              sizeY={1.5}
              // material={GlassMaterial}
              onPointerEnter={() => setOrbitControl(false)}
              onPointerLeave={() => setOrbitControl(true)}
              alignItems="stretch"
            >
              <Glass borderRadius={48} padding={64} alignItems="stretch" height={'100%'}>
                {/* <Container width={480} backgroundColor="blue" /> */}
                <Container alignItems="stretch" animation={noAnimation} height={'100%'}>
                  <Container flexDirection="row" gapColumn={48} alignItems="stretch" overflow="scroll" animation={noAnimation} height={'100%'}>
                    <Suspense alignItems="stretch" animation={noAnimation} height={'100%'}>
                      {mediaDb.map((e, i) => {
                        const thumb = mediaPath + (e.thumb || e.src)
                        // console.log(thumb)
                        return <Image key={'img' + i} height={'100%'} url={thumb} borderRadius={32} onClick={() => setPhotoIndex(i)} />
                      })}
                    </Suspense>
                  </Container>
                </Container>
              </Glass>
            </RootContainer>
          </a.group>
        </a.group>
      </>
    )
  )
}
