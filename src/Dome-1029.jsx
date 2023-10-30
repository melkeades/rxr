import { useCallback } from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
// import Hls from 'hls.js'
import * as THREE from 'three'

export default function Dome({ photoIndex, setPhotoIndex, mediaPath, mediaDb }) {
  const [videoElement, setVideoElement] = useState()
  const [texture, setTexture] = useState()
  const [videoPaused, setVideoPaused] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [mediaType, setMediaType] = useState()
  const initDone = useRef(false)

  const sel = (e) => document.querySelector(e)
  const pause$ = sel('.btn--pause')
  const vol$ = sel('.btn--vol')
  let _texture = {}

  useEffect(() => {
    console.log('index: ' + photoIndex)
    // let _texture = {}
    const _mediaType = mediaDb[photoIndex].type
    const file = mediaPath + mediaDb[photoIndex].src
    if (_mediaType === 'video') {
      //  hls.loadSource(file)
      //  hls.attachMedia(videoElement)
      //  hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //    videoElement.play()
      //  })
      const _videoElement = document.createElement('video')
      _videoElement.crossOrigin = 'Anonymous'
      _videoElement.loop = true
      _videoElement.muted = true
      _videoElement.volume = 0.5
      _videoElement.src = file
      _videoElement.load()
      if (!videoPaused) {
        // _videoElement.play()
      } else {
        pause$.style.opacity = 1
        setVideoPaused(!videoPaused)
      }
      _videoElement.play()
      _texture = new THREE.VideoTexture(_videoElement)
      setVideoElement(_videoElement)
      // console.log('video')
    } else if (_mediaType === 'image') {
      _texture = new THREE.TextureLoader().load(file)
      // console.log('image')
    }
    _texture.mapping = THREE.EquirectangularReflectionMapping
    _texture.colorSpace = THREE.SRGBColorSpace
    _texture.minFilter = _texture.magFilter = THREE.LinearFilter
    setTexture(_texture)
    setMediaType(_mediaType)
    return () => {
      if (initDone.current) _texture.dispose()
      // else initDone.current = true
    }
  }, [photoIndex, mediaType])

  useEffect(() => {
    function handler() {
      console.log('handler')
      if (mediaType === 'video') {
        console.log('is video')
        if (videoPaused) {
          pause$.style.opacity = 1
          videoElement.play()
          // console.log('pl', videoElement.play)
        } else {
          pause$.style.opacity = 0.3
          // console.log('pa')
          videoElement.pause()
        }
        setVideoPaused(!videoPaused)
      }
    }
    pause$.addEventListener('click', handler)
    return () => pause$.removeEventListener('click', handler)
  }, [videoPaused, videoElement, mediaType])

  useEffect(() => {
    function handler() {
      vol$.style.opacity = videoMuted ? 1 : 0.3
      setVideoMuted(!videoMuted)
      console.log('mm')
    }
    vol$.addEventListener('click', handler)
    return () => vol$.removeEventListener('click', handler)
  }, [videoMuted])

  return (
    <>
      <mesh position={[0, 0, 0]} scale-x={-1}>
        <sphereGeometry attach="geometry" args={[100, 100, 100]} />
        <meshBasicMaterial attach="material" toneMapped={false} map={texture} side={THREE.BackSide} onUpdate={(self) => (self.needsUpdate = true)} />
      </mesh>
    </>
  )
}
