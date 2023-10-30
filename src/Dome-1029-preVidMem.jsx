import { useCallback } from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
// import Hls from 'hls.js'
import * as THREE from 'three'
import { useVideoTexture } from '@react-three/drei'

export default function Dome({ photoIndex, setPhotoIndex, mediaPath, mediaDb }) {
  const { gl } = useThree()
  const videoElement = useRef()
  const [texture, setTexture] = useState()
  const [videoPaused, setVideoPaused] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [mediaType, setMediaType] = useState()
  const initDone = useRef(false)

  const sel = (e) => document.querySelector(e)
  const pause$ = sel('.btn--pause')
  const vol$ = sel('.btn--vol')
  let _texture = {}
  // const v = useVideoTexture('/360/w5.mp4')
  // const _vd = document.createElement('video')
  // _vd.src = '/360/w5.mp4'
  // _vd.muted = true
  // const vd = new THREE.VideoTexture(_vd)
  // console.log(v, vd)
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
      _videoElement.muted = false
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
      videoElement.current = _videoElement
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
      // gl.renderLists.dispose()
      if (mediaType === 'video') {
        videoElement.current?.pause()
        videoElement.current?.remove()
        // videoElement.src = ''
        // videoElement.load()
        // videoElement.remove()
        console.log('remove')
        // _texture.dispose()
      }
      // if (initDone.current)
      // else initDone.current = true
    }
  }, [photoIndex, mediaType])

  // useEffect(() => {
  //   return function () {
  //     videoElement.current?.pause()
  //     videoElement.current?.remove()
  //   }
  // }, [photoIndex])

  useEffect(() => {
    function handler() {
      console.log('handler')
      if (mediaType === 'video') {
        console.log('is video')
        if (videoPaused) {
          pause$.style.opacity = 1
          videoElement.current.play()
          // console.log('pl', videoElement.play)
        } else {
          pause$.style.opacity = 0.3
          // console.log('pa')
          videoElement.current.pause()
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
