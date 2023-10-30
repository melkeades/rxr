import { useCallback } from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
// import Hls from 'hls.js'
import * as THREE from 'three'
import { useTexture, useVideoTexture } from '@react-three/drei'

const sel = (e) => document.querySelector(e)
const pause$ = sel('.btn--pause')
const vol$ = sel('.btn--vol')

function ImageTexture({ mediaFile, texture, setTexture }) {
  const _texture = useTexture(mediaFile)

  return <meshBasicMaterial attach="material" map={_texture} toneMapped={false} side={THREE.BackSide} onUpdate={(self) => (self.needsUpdate = true)} />
}
function VideoTexture({ mediaFile, texture, setTexture, videoPaused, setVideoPaused, videoMuted, setVideoMuted }) {
  const videoProps = {
    crossOrigin: 'Anonymous',
    loop: true,
    muted: true,
    volume: 0.5,
  }
  // console.log(mediaFile)
  const _texture = useVideoTexture(mediaFile, videoProps)

  useEffect(() => {
    setTexture(_texture.image)
  }, [_texture])

  return <meshBasicMaterial attach="material" map={_texture} toneMapped={false} side={THREE.BackSide} onUpdate={(self) => (self.needsUpdate = true)} />
}
export default function Dome({ photoIndex, setPhotoIndex, mediaPath, mediaDb }) {
  // const { gl } = useThree()
  const [texture, setTexture] = useState()
  const [prevIndex, setPrevIndex] = useState(photoIndex)
  const [videoPaused, setVideoPaused] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [mediaType, setMediaType] = useState(mediaDb[photoIndex].type)
  const [mediaFile, setMediaFile] = useState(mediaPath + mediaDb[photoIndex].src)

  useEffect(() => {
    texture?.pause()
    texture?.remove()
    setMediaType(mediaDb[photoIndex].type)
    setMediaFile(mediaPath + mediaDb[photoIndex].src)
  }, [photoIndex])

  useEffect(() => {
    if (videoPaused && mediaType === 'video') {
      texture.pause()
    }
  }, [photoIndex, texture, videoPaused, mediaType])

  useEffect(() => {
    function handler() {
      // console.log('handler')
      if (mediaType === 'video') {
        if (videoPaused) {
          pause$.style.opacity = 1
          texture.play()
        } else {
          pause$.style.opacity = 0.3
          texture.pause()
        }
        setVideoPaused(!videoPaused)
      }
    }
    pause$.addEventListener('click', handler)
    return () => pause$.removeEventListener('click', handler)
  }, [videoPaused, texture, mediaType])

  useEffect(() => {
    if (!videoMuted && mediaType === 'video') {
      console.log('change while unmuted')
      texture.muted = false
    }
    if (videoMuted && mediaType === 'video' && texture) {
      texture.muted = true
    }
  }, [photoIndex, texture, videoMuted, mediaType])

  useEffect(() => {
    function handler() {
      if (mediaType === 'video') {
        if (!videoMuted) {
          vol$.style.opacity = 1
          texture.muted = true
          console.log('muted')
        } else {
          vol$.style.opacity = 0.3
          texture.muted = false
          console.log('unmuted')
        }
        setVideoMuted(!videoMuted)
      }
    }
    vol$.addEventListener('click', handler)
    return () => vol$.removeEventListener('click', handler)
  }, [videoMuted, texture, mediaType])

  return (
    <>
      <mesh position={[0, 0, 0]} scale-x={-1}>
        <sphereGeometry attach="geometry" args={[100, 100, 100]} />
        {mediaType === 'video' ? (
          <VideoTexture
            mediaFile={mediaFile}
            texture={texture}
            setTexture={setTexture}
            videoPaused={videoPaused}
            setVideoPaused={setVideoPaused}
            videoMuted={videoMuted}
            setVideoMuted={setVideoMuted}
          />
        ) : (
          <ImageTexture mediaFile={mediaFile} texture={texture} setTexture={setTexture} />
        )}
      </mesh>
    </>
  )
}
