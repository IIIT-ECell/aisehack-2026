"use client";

import {
    EffectComposer,
    Bloom,
    Vignette,
} from "@react-three/postprocessing";

export default function PostProcessing() {
    return (
        <EffectComposer multisampling={0}>
            <Bloom
                intensity={1.2}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                mipmapBlur
                levels={3}
            />
            <Vignette
                offset={0.3}
                darkness={0.5}
            />
        </EffectComposer>
    );
}
