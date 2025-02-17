let camera, scene, renderer, controls;
let house;
let renderers = {};  // Make renderers accessible globally

// Room dimensions
const rooms = {
    livingRoom: { width: 6, height: 3, depth: 5, name: '거실' },
    bedroom: { width: 4, height: 3, depth: 4, name: 'Bedroom' },
    kitchen: { width: 5, height: 3, depth: 5, name: 'Kitchen' },
    bathroom: { width: 3, height: 3, depth: 4, name: 'Bathroom' }  // Increased from 2x3 to 3x4
};

// Material declarations
const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
const woodMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 }); // Wood brown for door and frame
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    createHouse();

    window.addEventListener('resize', onWindowResize, false);
}

function createHouse() {
    house = new THREE.Group();
    let livingRoomPosition, bedroomPosition, kitchenPosition;

    // Create rooms
    Object.entries(rooms).forEach(([key, room]) => {
        const geometry = new THREE.BoxGeometry(room.width, room.height, room.depth);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        
        // Position rooms
        switch(key) {
            case 'livingRoom':
                line.position.set(0, 0, 0);
                livingRoomPosition = line.position;
                addLivingRoomFurniture(line.position);
                break;
            case 'bedroom':
                line.position.set(5, 0, 0);
                bedroomPosition = line.position;
                addBedroomFurniture(line.position);
                break;
            case 'kitchen':
                line.position.set(-5.5, 0, 0);
                kitchenPosition = line.position;
                addKitchenFurniture(line.position);
                break;
            case 'bathroom':
                line.position.set(0, 0, 4.5);  // Adjusted to be directly adjacent to living room (5/2 + 4/2 = 4.5)
                addBathroomFurniture(line.position);
                break;
        }

        line.userData = { type: 'room', name: room.name };
        house.add(line);
    });

    scene.add(house);
    createCCTVs(livingRoomPosition, bedroomPosition, kitchenPosition);
}

function addLivingRoomFurniture(roomPosition) {
    // LED Screen (black rectangle)
    const screenWidth = 2;
    const screenHeight = 1.2;
    const screenDepth = 0.1;
    const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, screenDepth);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        emissive: 0x222222 
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    // Position screen on the wall opposite to bathroom, at a lower height
    screen.position.set(
        roomPosition.x, 
        roomPosition.y - rooms.livingRoom.height/2 + screenHeight + 0.5, 
        roomPosition.z - rooms.livingRoom.depth/2 + screenDepth/2
    );
    screen.userData = { type: 'furniture', name: 'LED Screen' };
    house.add(screen);

    // Desk
    const deskGeometry = new THREE.BoxGeometry(2.5, 0.05, 0.8);
    const deskMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(roomPosition.x, roomPosition.y - rooms.livingRoom.height/2 + 0.75, roomPosition.z - rooms.livingRoom.depth/2 + 1);
    desk.userData = { type: 'furniture', name: 'Desk' };
    house.add(desk);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.05, 0.75, 0.05);
    const legPositions = [
        [-1.2, -0.375, 0.35],
        [1.2, -0.375, 0.35],
        [-1.2, -0.375, -0.35],
        [1.2, -0.375, -0.35]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, deskMaterial);
        leg.position.set(
            desk.position.x + pos[0],
            desk.position.y + pos[1],
            desk.position.z + pos[2]
        );
        house.add(leg);
    });

    // Chair
    const chairSeatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
    const chairMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
    chairSeat.position.set(roomPosition.x, roomPosition.y - rooms.livingRoom.height/2 + 0.45, roomPosition.z - rooms.livingRoom.depth/2 + 1.5);
    chairSeat.userData = { type: 'furniture', name: 'Chair' };
    house.add(chairSeat);

    // Chair backrest
    const backrestGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
    const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
    backrest.position.set(
        chairSeat.position.x,
        chairSeat.position.y + 0.25,
        chairSeat.position.z + 0.225
    );
    house.add(backrest);

    // Chair legs
    const chairLegGeometry = new THREE.BoxGeometry(0.05, 0.45, 0.05);
    const chairLegPositions = [
        [-0.2, -0.225, -0.2],
        [0.2, -0.225, -0.2],
        [-0.2, -0.225, 0.2],
        [0.2, -0.225, 0.2]
    ];

    chairLegPositions.forEach(pos => {
        const leg = new THREE.Mesh(chairLegGeometry, chairMaterial);
        leg.position.set(
            chairSeat.position.x + pos[0],
            chairSeat.position.y + pos[1],
            chairSeat.position.z + pos[2]
        );
        house.add(leg);
    });

    // Studio Monitor Speakers and Stands
    function createSpeakerWithStand(x, isRight) {
        const group = new THREE.Group();
        
        // Speaker Stand Base (triangular)
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 3);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x2b2b2b });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -rooms.livingRoom.height/2;
        group.add(base);

        // Stand Pole
        const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8);
        const pole = new THREE.Mesh(poleGeometry, baseMaterial);
        pole.position.y = base.position.y + 0.55;
        group.add(pole);

        // Speaker
        const speakerGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.25);
        const speakerMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
        speaker.position.y = pole.position.y + 0.55;
        
        // Speaker front (driver cone visual)
        const driverGeometry = new THREE.CircleGeometry(0.08, 32);
        const driverMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
        const driver = new THREE.Mesh(driverGeometry, driverMaterial);
        driver.position.z = 0.126;
        driver.position.y = 0.05;
        speaker.add(driver);

        // Tweeter
        const tweeterGeometry = new THREE.CircleGeometry(0.03, 32);
        const tweeter = new THREE.Mesh(tweeterGeometry, driverMaterial);
        tweeter.position.z = 0.126;
        tweeter.position.y = 0.15;
        speaker.add(tweeter);

        group.add(speaker);

        // Position the entire speaker setup
        group.position.set(
            x, 
            roomPosition.y, 
            roomPosition.z - rooms.livingRoom.depth/2 + 1
        );

        // Angle the speakers slightly inward
        group.rotateY(isRight ? -Math.PI/12 : Math.PI/12);
        
        group.userData = { type: 'furniture', name: 'Studio Monitor' };
        house.add(group);
    }

    // Create left and right speakers
    createSpeakerWithStand(roomPosition.x - 1.5, false); // Left speaker
    createSpeakerWithStand(roomPosition.x + 1.5, true);  // Right speaker
}

function addBedroomFurniture(roomPosition) {
    // Create bed frame - swapped width and depth for rotation
    const bedFrameGeometry = new THREE.BoxGeometry(1.2, 0.3, 2.2); // Standard single bed size, rotated
    const bedMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const bedFrame = new THREE.Mesh(bedFrameGeometry, bedMaterial);
    
    // Position bed against right wall
    bedFrame.position.set(
        roomPosition.x + rooms.bedroom.width/2 - bedFrameGeometry.parameters.width/2 - 0.1, // 0.1 units from wall
        roomPosition.y - rooms.bedroom.height/2 + bedFrameGeometry.parameters.height/2,
        roomPosition.z
    );
    bedFrame.userData = { type: 'furniture', name: 'Bed Frame' };
    house.add(bedFrame);

    // Create mattress (slightly smaller than frame)
    const mattressGeometry = new THREE.BoxGeometry(1.15, 0.2, 2.15);
    const mattress = new THREE.Mesh(mattressGeometry, bedMaterial);
    mattress.position.set(
        bedFrame.position.x,
        bedFrame.position.y + bedFrameGeometry.parameters.height/2 + mattressGeometry.parameters.height/2,
        bedFrame.position.z
    );
    mattress.userData = { type: 'furniture', name: 'Mattress' };
    house.add(mattress);

    // Create pillows - repositioned for new orientation
    const pillowGeometry = new THREE.BoxGeometry(0.7, 0.1, 0.4);
    const pillowMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    // Left pillow
    const leftPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    leftPillow.position.set(
        mattress.position.x - 0.2,
        mattress.position.y + mattressGeometry.parameters.height/2 + pillowGeometry.parameters.height/2,
        mattress.position.z - 0.8 // Moved to head of bed
    );
    leftPillow.userData = { type: 'furniture', name: 'Pillow' };
    house.add(leftPillow);

    // Right pillow
    const rightPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    rightPillow.position.set(
        mattress.position.x + 0.2,
        mattress.position.y + mattressGeometry.parameters.height/2 + pillowGeometry.parameters.height/2,
        mattress.position.z - 0.8 // Moved to head of bed
    );
    rightPillow.userData = { type: 'furniture', name: 'Pillow' };
    house.add(rightPillow);

    // Add legs to bed frame - adjusted for new dimensions
    const legGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.08);
    const legPositions = [
        [-0.55, -0.25, 1.05],  // Front left
        [0.55, -0.25, 1.05],   // Front right
        [-0.55, -0.25, -1.05], // Back left
        [0.55, -0.25, -1.05]   // Back right
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, bedMaterial);
        leg.position.set(
            bedFrame.position.x + pos[0],
            bedFrame.position.y + pos[1],
            bedFrame.position.z + pos[2]
        );
        house.add(leg);
    });
}

function addKitchenFurniture(roomPosition) {
    // Counter along the back wall
    const counterDepth = 0.6;
    const counterHeight = 0.9;
    const counterGeometry = new THREE.BoxGeometry(4.8, counterHeight, counterDepth);
    const counterMaterial = new THREE.MeshPhongMaterial({ color: 0x383838 }); // Dark gray
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    
    counter.position.set(
        roomPosition.x,
        roomPosition.y - rooms.kitchen.height/2 + counterHeight/2,
        roomPosition.z - rooms.kitchen.depth/2 + counterDepth/2
    );
    counter.userData = { type: 'furniture', name: 'Kitchen Counter' };
    house.add(counter);

    // Upper cabinets
    const upperCabinetGeometry = new THREE.BoxGeometry(4.8, 0.9, 0.4);
    const upperCabinet = new THREE.Mesh(upperCabinetGeometry, counterMaterial);
    upperCabinet.position.set(
        roomPosition.x,
        roomPosition.y + 0.3,
        roomPosition.z - rooms.kitchen.depth/2 + 0.2
    );
    upperCabinet.userData = { type: 'furniture', name: 'Upper Cabinets' };
    house.add(upperCabinet);

    // Sink
    const sinkGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.5);
    const sinkMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 }); // Metallic gray
    const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
    sink.position.set(
        roomPosition.x - 1,
        counter.position.y + counterHeight/2,
        counter.position.z
    );
    sink.userData = { type: 'furniture', name: 'Sink' };
    house.add(sink);

    // Stove
    const stoveGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.5);
    const stoveMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const stove = new THREE.Mesh(stoveGeometry, stoveMaterial);
    stove.position.set(
        roomPosition.x + 1,
        counter.position.y + counterHeight/2,
        counter.position.z
    );
    stove.userData = { type: 'furniture', name: 'Stove' };
    house.add(stove);

    // Dining Table
    const tableGeometry = new THREE.BoxGeometry(1.8, 0.05, 1.2); // Standard dining table size
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 }); // Changed to black
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(
        roomPosition.x,
        roomPosition.y - rooms.kitchen.height/2 + 0.75, // Standard table height
        roomPosition.z + 1
    );
    table.userData = { type: 'furniture', name: 'Dining Table' };
    house.add(table);

    // Table Legs
    const legGeometry = new THREE.BoxGeometry(0.05, 0.73, 0.05);
    const legPositions = [
        [-0.85, -0.37, 0.55],  // Front left
        [0.85, -0.37, 0.55],   // Front right
        [-0.85, -0.37, -0.55], // Back left
        [0.85, -0.37, -0.55]   // Back right
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, tableMaterial);
        leg.position.set(
            table.position.x + pos[0],
            table.position.y + pos[1],
            table.position.z + pos[2]
        );
        house.add(leg);
    });

    // Add 4 Chairs
    const chairPositions = [
        { x: -0.7, z: 0, rotation: Math.PI/2 },     // Left chair
        { x: 0.7, z: 0, rotation: -Math.PI/2 },     // Right chair
        { x: 0, z: 0.7, rotation: Math.PI },        // Front chair
        { x: 0, z: -0.7, rotation: 0 }              // Back chair
    ];

    chairPositions.forEach(pos => {
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const seat = new THREE.Mesh(seatGeometry, tableMaterial);
        seat.position.set(
            table.position.x + pos.x,
            roomPosition.y - rooms.kitchen.height/2 + 0.45, // Fixed height to be on floor
            table.position.z + pos.z
        );
        seat.rotation.y = pos.rotation;
        house.add(seat);

        // Chair backrest
        const backrestGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.05);
        const backrest = new THREE.Mesh(backrestGeometry, tableMaterial);
        backrest.position.set(
            seat.position.x - (Math.sin(pos.rotation) * 0.175), // Inverted sine for correct facing
            seat.position.y + 0.225,
            seat.position.z - (Math.cos(pos.rotation) * 0.175)  // Inverted cosine for correct facing
        );
        backrest.rotation.y = pos.rotation;
        house.add(backrest);

        // Chair legs
        const chairLegGeometry = new THREE.BoxGeometry(0.05, 0.45, 0.05);
        const chairLegPositions = [
            { x: -0.15, z: -0.15 },
            { x: 0.15, z: -0.15 },
            { x: -0.15, z: 0.15 },
            { x: 0.15, z: 0.15 }
        ];

        chairLegPositions.forEach(legPos => {
            const chairLeg = new THREE.Mesh(chairLegGeometry, tableMaterial);
            const rotatedX = legPos.x * Math.cos(pos.rotation) - legPos.z * Math.sin(pos.rotation);
            const rotatedZ = legPos.x * Math.sin(pos.rotation) + legPos.z * Math.cos(pos.rotation);
            chairLeg.position.set(
                seat.position.x + rotatedX,
                roomPosition.y - rooms.kitchen.height/2 + 0.225, // Fixed height to be on floor
                seat.position.z + rotatedZ
            );
            house.add(chairLeg);
        });
    });
}

function addBathroomFurniture(roomPosition) {
    const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    // Mirror above sink - simplified
    const mirrorGeometry = new THREE.BoxGeometry(0.05, 1, 0.8);
    const mirrorMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 }); // Dark gray for mirror
    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    mirror.position.set(
        roomPosition.x - rooms.bathroom.width/2 + 0.05,
        roomPosition.y - rooms.bathroom.height/2 + 1.8,
        roomPosition.z - rooms.bathroom.depth/2 + 1.5
    );
    mirror.userData = { type: 'furniture', name: 'Mirror' };
    house.add(mirror);

    // Mirror frame
    const mirrorFrameGeometry = new THREE.BoxGeometry(0.07, 1.1, 0.9);
    const mirrorFrame = new THREE.Mesh(mirrorFrameGeometry, blackMaterial);
    mirrorFrame.position.set(
        mirror.position.x - 0.01,
        mirror.position.y,
        mirror.position.z
    );
    house.add(mirrorFrame);

    // Toilet
    const toiletBaseGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.5);
    const toiletBase = new THREE.Mesh(toiletBaseGeometry, blackMaterial);
    
    toiletBase.position.set(
        roomPosition.x + 0.3,
        roomPosition.y - rooms.bathroom.height/2 + 0.2,
        roomPosition.z + rooms.bathroom.depth/2 - 0.3
    );
    toiletBase.rotation.y = Math.PI;
    toiletBase.userData = { type: 'furniture', name: 'Toilet' };
    house.add(toiletBase);

    // Toilet tank
    const tankGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
    const tank = new THREE.Mesh(tankGeometry, blackMaterial);
    tank.position.set(
        toiletBase.position.x,
        toiletBase.position.y + 0.5,
        toiletBase.position.z + 0.15
    );
    tank.rotation.y = Math.PI;
    house.add(tank);

    // Toilet seat
    const seatGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.4);
    const seat = new THREE.Mesh(seatGeometry, blackMaterial);
    seat.position.set(
        toiletBase.position.x,
        toiletBase.position.y + 0.2,
        toiletBase.position.z - 0.05
    );
    seat.rotation.y = Math.PI;
    house.add(seat);

    // Sink
    const sinkBaseGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
    const sinkBase = new THREE.Mesh(sinkBaseGeometry, blackMaterial);
    
    sinkBase.position.set(
        roomPosition.x - rooms.bathroom.width/2 + 0.3,
        roomPosition.y - rooms.bathroom.height/2 + 0.8,
        roomPosition.z - rooms.bathroom.depth/2 + 1.5
    );
    sinkBase.userData = { type: 'furniture', name: 'Sink' };
    house.add(sinkBase);

    // Sink basin
    const basinGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.4);
    const basin = new THREE.Mesh(basinGeometry, blackMaterial);
    basin.position.set(
        sinkBase.position.x,
        sinkBase.position.y + 0.05,
        sinkBase.position.z
    );
    house.add(basin);

    // Faucet
    const faucetGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.2);
    const faucet = new THREE.Mesh(faucetGeometry, blackMaterial);
    faucet.position.set(
        sinkBase.position.x - 0.1,
        sinkBase.position.y + 0.1,
        sinkBase.position.z
    );
    house.add(faucet);

    // Shower
    const showerBaseGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    const showerMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const showerBase = new THREE.Mesh(showerBaseGeometry, showerMaterial);
    
    showerBase.position.set(
        roomPosition.x - rooms.bathroom.width/2 + 0.7, // Left corner
        roomPosition.y - rooms.bathroom.height/2 + 0.05,
        roomPosition.z + rooms.bathroom.depth/2 - 0.7  // Changed to positive to move to far corner
    );
    showerBase.userData = { type: 'furniture', name: 'Shower' };
    house.add(showerBase);

    // Shower head and pipe - moved inside the booth
    const showerHeadGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const showerHead = new THREE.Mesh(showerHeadGeometry, showerMaterial);
    showerHead.position.set(
        showerBase.position.x - 0.4, // Moved inside, near left wall
        roomPosition.y + rooms.bathroom.height/2 - 0.2,
        showerBase.position.z
    );
    house.add(showerHead);

    // Shower pipe
    const pipGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    const pipe = new THREE.Mesh(pipGeometry, showerMaterial);
    pipe.position.set(
        showerHead.position.x,
        showerHead.position.y - 0.15,
        showerHead.position.z
    );
    house.add(pipe);

    // Glass walls for shower - extended to ceiling
    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xc4e4ff,
        transparent: true,
        opacity: 0.3
    });

    // Back glass wall
    const backGlassGeometry = new THREE.BoxGeometry(1.2, rooms.bathroom.height, 0.05);
    const backGlass = new THREE.Mesh(backGlassGeometry, glassMaterial);
    backGlass.position.set(
        showerBase.position.x,
        roomPosition.y,  // Centered vertically
        showerBase.position.z + 0.6
    );
    house.add(backGlass);

    // Left side glass wall
    const leftGlassGeometry = new THREE.BoxGeometry(0.05, rooms.bathroom.height, 1.2);
    const leftGlass = new THREE.Mesh(leftGlassGeometry, glassMaterial);
    leftGlass.position.set(
        showerBase.position.x - 0.6,
        roomPosition.y,  // Centered vertically
        showerBase.position.z
    );
    house.add(leftGlass);

    // Half front glass wall (entrance side)
    const frontGlassGeometry = new THREE.BoxGeometry(0.6, rooms.bathroom.height, 0.05);
    const frontGlass = new THREE.Mesh(frontGlassGeometry, glassMaterial);
    frontGlass.position.set(
        showerBase.position.x + 0.3,
        roomPosition.y,  // Centered vertically
        showerBase.position.z - 0.6
    );
    house.add(frontGlass);

    // Metal frame for glass (top and bottom rails)
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    
    // Top rail
    const topRailGeometry = new THREE.BoxGeometry(1.2, 0.05, 1.2);
    const topRail = new THREE.Mesh(topRailGeometry, frameMaterial);
    topRail.position.set(
        showerBase.position.x,
        roomPosition.y + rooms.bathroom.height/2,  // At ceiling
        showerBase.position.z
    );
    house.add(topRail);

    // Bottom rail
    const bottomRail = new THREE.Mesh(topRailGeometry, frameMaterial);
    bottomRail.position.set(
        showerBase.position.x,
        roomPosition.y - rooms.bathroom.height/2 + 0.05,
        showerBase.position.z
    );
    house.add(bottomRail);

    // Vertical frame posts - extended to ceiling
    const postGeometry = new THREE.BoxGeometry(0.05, rooms.bathroom.height, 0.05);
    const postPositions = [
        { x: -0.6, z: -0.6 },  // Front left
        { x: 0.6, z: -0.6 },   // Front right
        { x: -0.6, z: 0.6 },   // Back left
        { x: 0.6, z: 0.6 }     // Back right
    ];

    postPositions.forEach(pos => {
        const post = new THREE.Mesh(postGeometry, frameMaterial);
        post.position.set(
            showerBase.position.x + pos.x,
            roomPosition.y,  // Centered vertically
            showerBase.position.z + pos.z
        );
        house.add(post);
    });

    // Add bathroom walls
    const wallMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide  // Visible from both sides
    });
    const doorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        side: THREE.DoubleSide  // Visible from both sides
    });
    
    // Front wall (with door hole)
    const frontWallGeometry = new THREE.BoxGeometry(rooms.bathroom.width, rooms.bathroom.height, 0.1);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(
        roomPosition.x,
        roomPosition.y,
        roomPosition.z - rooms.bathroom.depth/2
    );
    house.add(frontWall);

    // Side walls to ensure no gaps
    const sideWallGeometry = new THREE.BoxGeometry(0.1, rooms.bathroom.height, rooms.bathroom.depth);
    [-1, 1].forEach(side => {
        const sideWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        sideWall.position.set(
            roomPosition.x + (rooms.bathroom.width/2 + 0.05) * side,
            roomPosition.y,
            roomPosition.z
        );
        house.add(sideWall);
    });

    // Add bathroom door (closed)
    const doorWidth = 0.9;
    const doorHeight = 2.1;
    const doorDepth = 0.1;  // Made slightly thicker
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(
        roomPosition.x - rooms.bathroom.width/4,
        roomPosition.y - rooms.bathroom.height/2 + doorHeight/2,
        roomPosition.z - rooms.bathroom.depth/2
    );
    house.add(door);

    // Door frame
    const frameThickness = 0.05;
    const frameDepth = 0.15;  // Made frame deeper than door

    // Top frame
    const topFrameGeometry = new THREE.BoxGeometry(doorWidth + frameThickness*2, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, doorMaterial);
    topFrame.position.set(
        door.position.x,
        door.position.y + doorHeight/2 + frameThickness/2,
        door.position.z
    );
    house.add(topFrame);

    // Side frames
    const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, doorHeight + frameThickness, frameDepth);
    [-1, 1].forEach(side => {
        const sideFrame = new THREE.Mesh(sideFrameGeometry, doorMaterial);
        sideFrame.position.set(
            door.position.x + (doorWidth/2 + frameThickness/2) * side,
            door.position.y,
            door.position.z
        );
        house.add(sideFrame);
    });
}

function createCCTVs(livingRoomPosition, bedroomPosition, kitchenPosition) {
    // Create both CCTV and face cameras with different sizes
    function createCamera(position, rotation, isCCTV = true) {
        const group = new THREE.Group();
        
        // Create camera body - larger for CCTV
        const bodySize = isCCTV ? 0.3 : 0.15;
        const cameraGeometry = new THREE.BoxGeometry(bodySize, bodySize, bodySize * 2);
        const cameraMesh = new THREE.Mesh(cameraGeometry, blackMaterial);
        if (!isCCTV) cameraMesh.layers.set(1);  // Only set layer 1 for artist cameras
        
        // Create camera lens - larger for CCTV
        const lensRadius = isCCTV ? 0.1 : 0.05;
        const lensGeometry = new THREE.CylinderGeometry(lensRadius, lensRadius, 0.1, 16);
        const lensMesh = new THREE.Mesh(lensGeometry, blackMaterial);
        lensMesh.rotation.x = Math.PI / 2;
        lensMesh.position.z = bodySize;
        if (!isCCTV) lensMesh.layers.set(1);  // Only set layer 1 for artist cameras
        
        group.add(cameraMesh);
        group.add(lensMesh);
        
        if (isCCTV) {
            // Create mount for CCTV - larger
            const mountGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16);
            const mountMesh = new THREE.Mesh(mountGeometry, blackMaterial);
            mountMesh.position.y = 0.2;
            group.add(mountMesh);
        }
        
        // Set position and rotation
        if (position) group.position.copy(position);
        if (rotation) group.rotation.copy(rotation);
        if (!isCCTV) group.layers.set(1);  // Only set layer 1 for artist cameras
        
        return group;
    }
    
    // Create CCTV group
    const cctvGroup = new THREE.Group();
    cctvGroup.name = 'cctvCameras';

    // Add CCTVs
    const cctvPositions = [
        { 
            x: kitchenPosition.x,  // Center of kitchen
            y: kitchenPosition.y + rooms.kitchen.height/2 - 0.3, // Near kitchen ceiling
            z: kitchenPosition.z - rooms.kitchen.depth/2 + 0.5,  // Front of kitchen
            room: 'cam1',
            purpose: 'Kitchen View',
            rotation: { x: Math.PI/6, y: 0, z: 0 }  // Angled down
        },
        { 
            x: livingRoomPosition.x,  // Center of living room
            y: livingRoomPosition.y + rooms.livingRoom.height/2 - 0.3, // Near living room ceiling
            z: livingRoomPosition.z - rooms.livingRoom.depth/2 + 0.5,  // Front of living room
            room: 'cam2',
            purpose: 'Living Room View',
            rotation: { x: Math.PI/6, y: 0, z: 0 }  // Angled down
        },
        { 
            x: bedroomPosition.x,  // Center of bedroom
            y: bedroomPosition.y + rooms.bedroom.height/2 - 0.3, // Near bedroom ceiling
            z: bedroomPosition.z - rooms.bedroom.depth/2 + 0.5,  // Front of bedroom
            room: 'cam3',
            purpose: 'Bedroom View',
            rotation: { x: Math.PI/6, y: 0, z: 0 }  // Angled down
        }
    ];

    cctvPositions.forEach(pos => {
        const cctv = createCamera({ x: pos.x, y: pos.y, z: pos.z }, pos.rotation, true);  // true for CCTV style
        cctv.userData = {
            type: 'camera',
            name: pos.room,
            purpose: pos.purpose
        };
        cctvGroup.add(cctv);
    });

    house.add(cctvGroup);

    // Create face camera group
    const faceCameraGroup = new THREE.Group();
    faceCameraGroup.name = 'faceCameras';
    faceCameraGroup.layers.set(1);  // Only artist cameras on layer 1

    // Position face cameras to focus on the chair area
    const faceCameraPositions = [
        { 
            x: livingRoomPosition.x, 
            y: livingRoomPosition.y - rooms.livingRoom.height/2 + 1.2,
            z: livingRoomPosition.z + rooms.livingRoom.depth/2 - 0.5,
            room: '거실',
            purpose: 'Front Face Capture',
            rotation: { x: 0, y: 0, z: 0 }  // Reset to default rotation
        },
        { 
            x: livingRoomPosition.x - 1.5, 
            y: livingRoomPosition.y - rooms.livingRoom.height/2 + 1.5,
            z: livingRoomPosition.z - rooms.livingRoom.depth/2 + 0.8,
            room: '거실',
            purpose: 'Left Face Angle',
            rotation: { x: 0, y: Math.PI + Math.PI/6, z: 0 }  // Angled from left
        },
        { 
            x: livingRoomPosition.x + 1.5, 
            y: livingRoomPosition.y - rooms.livingRoom.height/2 + 1.5,
            z: livingRoomPosition.z - rooms.livingRoom.depth/2 + 0.8,
            room: '거실',
            purpose: 'Right Face Angle',
            rotation: { x: 0, y: Math.PI - Math.PI/6, z: 0 }  // Angled from right
        }
    ];

    faceCameraPositions.forEach((pos, index) => {
        const camera = createCamera(pos, pos.rotation, false);
        camera.userData = {
            type: 'camera',
            name: 'Face Camera',
            room: pos.room,
            purpose: pos.purpose,
            cameraIndex: index
        };
        faceCameraGroup.add(camera);
    });

    house.add(faceCameraGroup);
}

function updateCameraViews() {
    const cameras = {
        cam1: new THREE.PerspectiveCamera(60, 4/3, 0.1, 1000),  // Kitchen
        cam2: new THREE.PerspectiveCamera(60, 4/3, 0.1, 1000),  // Living Room
        cam3: new THREE.PerspectiveCamera(60, 4/3, 0.1, 1000),  // Bedroom
        artistCam1: new THREE.PerspectiveCamera(90, 4/3, 0.1, 1000),  // Narrower FOV for closer view
        artistCam2: new THREE.PerspectiveCamera(75, 4/3, 0.1, 1000),
        artistCam3: new THREE.PerspectiveCamera(75, 4/3, 0.1, 1000)
    };

    // Make all cameras not render layer 1 (where physical cameras are)
    Object.values(cameras).forEach(camera => {
        camera.layers.enable(0);  // Enable default layer
        camera.layers.disable(1); // Disable layer 1 (physical cameras)
    });

    // Create renderers for each camera
    Object.keys(cameras).forEach(id => {
        const viewport = document.getElementById(id);
        if (!viewport) return;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 1);
        renderer.outputEncoding = THREE.sRGBEncoding;  // Updated from gammaOutput
        renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);

        let canvas = viewport.querySelector('canvas');
        if (!canvas) {
            canvas = renderer.domElement;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            const filter = id.startsWith('artistCam') 
                ? 'contrast(1.4) brightness(1.1) grayscale(1)'
                : 'contrast(1.2) brightness(0.9) grayscale(1)';
            canvas.style.filter = filter;
            viewport.insertBefore(canvas, viewport.firstChild);
        }

        renderers[id] = renderer;
    });

    // Set up cameras
    if (scene) {
        const cctvGroup = scene.children.find(child => child.name === 'cctvCameras');
        const faceCameraGroup = scene.children.find(child => child.name === 'faceCameras');

        // Kitchen camera (CAM 01)
        cameras.cam1.position.set(-5.5, 4, 0);
        cameras.cam1.rotation.x = -Math.PI / 2;
        cameras.cam1.rotation.z = Math.PI;
        cameras.cam1.zoom = 1.2;
        cameras.cam1.updateProjectionMatrix();

        // Living room camera (CAM 02)
        cameras.cam2.position.set(0, 4, 0);
        cameras.cam2.rotation.x = -Math.PI / 2;
        cameras.cam2.rotation.z = Math.PI;
        cameras.cam2.zoom = 1.2;
        cameras.cam2.updateProjectionMatrix();

        // Bedroom camera (CAM 03)
        cameras.cam3.position.set(5, 4, 0);
        cameras.cam3.rotation.x = -Math.PI / 2;
        cameras.cam3.rotation.z = Math.PI;
        cameras.cam3.zoom = 1.2;
        cameras.cam3.updateProjectionMatrix();

        // Set up artist cameras
        if (faceCameraGroup) {
            const centerCam = faceCameraGroup.children[0];
            const leftCam = faceCameraGroup.children[1];
            const rightCam = faceCameraGroup.children[2];

            if (centerCam) {
                // Position Artist Cam 1 at eye level, looking at where a person would sit
                cameras.artistCam1.position.set(
                    livingRoomPosition.x,  // Center of room
                    livingRoomPosition.y - rooms.livingRoom.height/2 + 1.2,  // Eye level (about 1.2m high)
                    livingRoomPosition.z + rooms.livingRoom.depth/2 - 0.5    // Near the LED screen
                );
                cameras.artistCam1.rotation.set(
                    0,          // Level (not looking up or down)
                    Math.PI,    // Facing the chair
                    0
                );
                cameras.artistCam1.zoom = 2.0;  // Zoom to frame where a person would sit
                cameras.artistCam1.fov = 50;    // Slightly narrow FOV for portrait-like framing
                cameras.artistCam1.updateProjectionMatrix();
            }
            
            if (leftCam) {
                // Position Artist Cam 2 at left corner, looking at chair
                cameras.artistCam2.position.set(
                    livingRoomPosition.x - 1.5,  // Left side
                    livingRoomPosition.y - rooms.livingRoom.height/2 + 1.2,  // Eye level
                    livingRoomPosition.z + rooms.livingRoom.depth/2 - 0.5    // Near the LED screen
                );
                cameras.artistCam2.rotation.set(
                    0,                    // Level
                    Math.PI + Math.PI/6,  // Angled towards chair from left
                    0
                );
                cameras.artistCam2.zoom = 2.0;
                cameras.artistCam2.fov = 50;
                cameras.artistCam2.updateProjectionMatrix();
            }
            
            if (rightCam) {
                // Position Artist Cam 3 at right corner, looking at chair
                cameras.artistCam3.position.set(
                    livingRoomPosition.x + 1.5,  // Right side
                    livingRoomPosition.y - rooms.livingRoom.height/2 + 1.2,  // Eye level
                    livingRoomPosition.z + rooms.livingRoom.depth/2 - 0.5    // Near the LED screen
                );
                cameras.artistCam3.rotation.set(
                    0,                    // Level
                    Math.PI - Math.PI/6,  // Angled towards chair from right
                    0
                );
                cameras.artistCam3.zoom = 2.0;
                cameras.artistCam3.fov = 50;
                cameras.artistCam3.updateProjectionMatrix();
            }
        }
    }

    // Render each camera view
    function renderCameraViews() {
        Object.entries(cameras).forEach(([id, camera]) => {
            const viewport = document.getElementById(id);
            const renderer = renderers[id];  // Use global renderers
            if (!viewport || !renderer) return;

            const width = viewport.clientWidth;
            const height = viewport.clientHeight;

            if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
                renderer.setSize(width, height, false);
            }

            // Special handling for Artist cameras
            if (id === 'artistCam1') {
                camera.rotation.set(
                    0,          // Level
                    Math.PI,    // Facing chair
                    0
                );
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            } else if (id === 'artistCam2') {
                camera.rotation.set(
                    0,                    // Level
                    Math.PI + Math.PI/6,  // Angled from left
                    0
                );
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            } else if (id === 'artistCam3') {
                camera.rotation.set(
                    0,                    // Level
                    Math.PI - Math.PI/6,  // Angled from right
                    0
                );
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            } else {
                // Handle CCTV cameras
                const cctvGroup = scene.children.find(child => child.name === 'cctvCameras');
                if (cctvGroup) {
                    const cameraIndex = parseInt(id.replace('cam', '')) - 1;
                    if (cameraIndex >= 0 && cameraIndex < cctvGroup.children.length) {
                        const cctv = cctvGroup.children[cameraIndex];
                        const wasVisible = cctv.visible;
                        cctv.visible = false;
                        renderer.render(scene, camera);
                        cctv.visible = wasVisible;
                    } else {
                        renderer.render(scene, camera);
                    }
                } else {
                    renderer.render(scene, camera);
                }
            }
        });

        // Update timestamps
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.querySelectorAll('.camera-time').forEach(el => {
            el.textContent = timeString;
        });

        requestAnimationFrame(renderCameraViews);
    }

    renderCameraViews();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Raycaster for interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(house.children, true);

    // Reset cursor
    document.body.style.cursor = 'default';

    if (intersects.length > 0) {
        // Get the first intersected object
        const object = intersects[0].object;

        // Check if the object has room data
        if (object.userData && object.userData.type === 'room') {
            document.body.style.cursor = 'pointer';
        }
    }
}

// Only add mousemove event listener
window.addEventListener('mousemove', onMouseMove);

updateCameraViews();
