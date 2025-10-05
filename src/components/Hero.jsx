import bgImage from "../assets/bg.png"
// import bgImage from "../assets/bg1.png"
// import robotImg from "../assets/robot.png"
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function RobotModel() {
  const { scene } = useGLTF("/robot.glb");// Place your robot model in public/robot.glb
  return <primitive object={scene} scale={2.2} position={[0, -1.9, 0]} />;
}

const Hero = () => {
  return (
    // <div className="min-h-screen w-full bg-cover bg-no-repeat bg-center"
    //     style={{ backgroundImage: `url(${bgImage})` }}>
    //   Hero Section
    // </div>

    <section className="relative min-h-[50vh] lg:min-h-[100vh] flex flex-col items-center justify-center w-full pt-[160px] pb-[60px]"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 -z-0 bg-no-repeat bg-center bg-cover overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}/>

      <div className="flex w-full z-10 justify-center">
        <span className="px-4 py-1 text-sm rounded-full border border-gray-300 shadow-sm bg-white/70 self-center lg:self-start">
          Innovating steps
        </span>
      </div>

      <div className="max-w-7xl mx-auto z-10 px-5 grid lg:grid-cols-2 gap-10 items-center w-[100%] place-items-center">
        {/* Left side: Robot */}
        <div className="flex justify-center h-full min-h-[250px] w-[90%]">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[-5, 5, 5]} intensity={0.8} />
            <RobotModel />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Right side: Text */}
        <div className="flex flex-col space-y-6 text-center items-center">
          {/* <span className="px-4 py-1 text-sm rounded-full border border-gray-300 shadow-sm bg-white/70 self-center lg:self-start">
            Innovating steps
          </span> */}

          <h1 className="text-3xl lg:text-5xl py-2 font-bold font-serif-display text-center leading-tight text-gray-900">
            Where Technology <br /> Meets Intelligence
          </h1>

          {/* <p className="text-gray-600 max-w-xl">
            We help building your dreams into miraculously true and help you
            reach new height, We help building your dreams into miraculously
            true and help you reach new height
          </p> */}

          {/* Highlighted box */}
          <div className="px-8 py-10 border border-transparent bg-[#ffffff10] shadow-md min-w-[200px] w-[60%] backdrop-blur-[1px]"
            style={{
              borderImage: "linear-gradient(135deg, #00E5FF, #7A5CFF, #FF6B00) 1"
            }}>
            <p className="text-gray-800 text-[16px] italic">
              "We help building your dreams into miraculously true and help you
              reach new height, We help building your dreams into miraculously
              true and help you reach new height."
            </p>
          </div>

          {/* Button */}
          <button className="px-6 py-3 mt-4 rounded-full bg-[#0d1b2a] text-white font-semibold shadow-md hover:shadow-lg hover:bg-[#1b263b] transition">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero
