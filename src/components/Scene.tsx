"use client"
import { CameraControls, Environment, Float, Image, MeshReflectorMaterial, OrbitControls, RenderTexture, Text } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Model } from './Camping'
import { degToRad, lerp } from 'three/src/math/MathUtils.js'
import { useFrame } from '@react-three/fiber'
import { Color, Mesh } from 'three'
import * as THREE from 'three'
import { useAtom } from 'jotai'
import { currentPageAtom } from './UI'



const bloomColor = new Color("#fff");
bloomColor.multiplyScalar(1.5);
export default function Scene() {
    const cameraControls = useRef<CameraControls>(null!);
    const imageRef = useRef<Mesh>(null!);
    const meshFitCameraStore = useRef<Mesh>(null!);
    const meshFitCameraHome = useRef<Mesh>(null!);
    const textMaterial = useRef<THREE.MeshBasicMaterial>(null!); 
    const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
    const intro = async () => {
        cameraControls.current.dolly(-22);
        cameraControls.current.smoothTime = 1.6;
        setTimeout(() => {
            setCurrentPage("home");
        }, 1200);
        fitCamera();
    };
    useFrame((state, delta) => {
        textMaterial.current.opacity = lerp(
            textMaterial.current.opacity,
            currentPage === "home" || currentPage === "intro" ? 1 : 0,
            delta * 1.5
        );
        if (imageRef.current) {
            imageRef.current.rotation.z += delta * 0.3 // Smooth rotation
        }
    })
    const fitCamera = async () => {
        if (currentPage === "store") {
            cameraControls.current.smoothTime = 0.8;
            cameraControls.current.fitToBox(meshFitCameraStore.current, true);
        } else {
            cameraControls.current.smoothTime = 1.6;
            cameraControls.current.fitToBox(meshFitCameraHome.current, true);
        }
    };
    useEffect(() => {
        intro();
    }, []);
    useEffect(() => {
        fitCamera();
        window.addEventListener("resize", fitCamera);
        return () => window.removeEventListener("resize", fitCamera);
    }, [currentPage]);
    return (
        <>
            <CameraControls ref={cameraControls} />
            <mesh ref={meshFitCameraHome} position-z={1.5} visible={false}>
                <boxGeometry args={[7.5, 2, 2]} />
                <meshBasicMaterial color="orange" transparent opacity={0.5} />
            </mesh>
            <Text font={'fonts/Poppins-SemiBold.ttf'} position-x={-1.3}
                position-y={-0.5}
                position-z={1}
                lineHeight={0.8}
                textAlign="center"
                rotation-y={degToRad(30)}
                anchorY={"bottom"}>
                आज़ाद
                <meshBasicMaterial color={bloomColor} toneMapped={false} ref={textMaterial}>
                    <RenderTexture attach="map">
                        <color attach="background" args={["#fff"]} />
                        <Float floatIntensity={4} >
                            <Image
                                ref={imageRef}
                                url="/images/img2.jpg"
                                scale={10}
                                position={[0, 0, 0]}
                            />


                        </Float>
                    </RenderTexture>
                </ meshBasicMaterial>
            </Text>
            <group rotateY={degToRad(-25)} position-x={3}>
                <Model scale={0.6} />
                <mesh ref={meshFitCameraStore} visible={false}>
                    <boxGeometry args={[2, 1, 2]} />
                    <meshBasicMaterial color="red" transparent opacity={0.5} />
                </mesh>
            </group>
            <mesh position-y={-0.58} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[100, 100]} />
                <MeshReflectorMaterial
                    blur={[100, 100]}
                    resolution={2048}
                    mixBlur={1}
                    mixStrength={10}
                    roughness={1}
                    depthScale={1}
                    opacity={0.5}
                    transparent
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#333"
                    metalness={0.5}
                />
            </mesh>
            <Environment files='/hdri/sunset.hdr' />
        </>
    )
}
