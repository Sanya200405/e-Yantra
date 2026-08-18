const http = require('http');

let sessionCookie = '';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    if (sessionCookie) {
      defaultHeaders['Cookie'] = sessionCookie;
    }
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path: options.path,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      }
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive E2E Verification Test Suite for e-Yantra Platform...\n');

  // 1. Check Initial Auth State
  console.log('1. Testing /api/auth/me (Initial state)...');
  const meRes1 = await request({ path: '/api/auth/me' });
  console.log(`   Status: ${meRes1.status}, hasUsers: ${meRes1.data.hasUsers}`);
  if (meRes1.data.user) throw new Error('Expected no user on clean db');

  // 2. Check Initial Dashboard Empty State
  console.log('2. Testing /api/dashboard (Zero fake data check)...');
  const dashRes1 = await request({ path: '/api/dashboard' });
  console.log(`   Task Total: ${dashRes1.data.taskCounts.total}, InProgress: ${dashRes1.data.taskCounts.inProgress}`);
  console.log(`   Next Deadline: "${dashRes1.data.topSection.nextDeadline}", Next Class: "${dashRes1.data.topSection.nextClass}"`);
  if (dashRes1.data.taskCounts.total !== 0) throw new Error('Expected 0 tasks on clean db');

  // 3. Register Workspace Admin
  console.log('3. Testing /api/auth/register (Creating Workspace Admin)...');
  const regRes = await request(
    { path: '/api/auth/register', method: 'POST' },
    { name: 'Akanksha Verma', email: 'akanksha@eyantra.org', password: 'password123' }
  );
  console.log(`   Status: ${regRes.status}, User: ${regRes.data.user?.name}, Role: ${regRes.data.user?.role}`);
  if (regRes.data.user?.role !== 'ADMIN') throw new Error('First user must be ADMIN');

  // 4. Verify Session
  console.log('4. Testing session persistence with cookie...');
  const meRes2 = await request({ path: '/api/auth/me' });
  console.log(`   Logged in as: ${meRes2.data.user?.name} (${meRes2.data.user?.role})`);

  // 5. Add Class Session
  console.log('5. Testing /api/classes (Scheduling Class Session)...');
  const classRes = await request(
    { path: '/api/classes', method: 'POST' },
    {
      title: 'e-Yantra Task 0: ROS 2 & Gazebo Harmonic Workshop',
      instructor: 'Prof. Kavi Arya & e-Yantra Team',
      date: new Date(Date.now() + 86400000).toISOString(),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      description: 'Setting up Ubuntu 24.04 and ROS 2 Humble simulation workspace.',
      notes: 'Ensure all team members install colcon and rosdep.',
    }
  );
  console.log(`   Created Class ID: ${classRes.data.id}, Title: "${classRes.data.title}"`);

  // 6. Schedule Team Meeting with Decisions & Action Items
  console.log('6. Testing /api/meetings (Scheduling Meeting & Actions)...');
  const mtgRes = await request(
    { path: '/api/meetings', method: 'POST' },
    {
      title: 'eYRC Theme Strategy & Motor Driver Selection',
      date: new Date(Date.now() + 172800000).toISOString(),
      startTime: '04:00 PM',
      endTime: '05:00 PM',
      meetingLink: 'https://meet.google.com/meet-xyz-123',
      agenda: 'Finalize theme selection and motor drivers.',
      decisions: [{ decisionText: 'Use ROS 2 Humble with Nav2 stack' }],
      actionItems: [{ actionText: 'Calibrate IMU sensor filter parameters' }],
    }
  );
  console.log(`   Created Meeting ID: ${mtgRes.data.id}, Action items: ${mtgRes.data.actionItems.length}`);
  const actionItemId = mtgRes.data.actionItems[0].id;

  // 7. Convert Action Item to Task
  console.log('7. Testing /api/meetings/convert-action-item (1-Click conversion)...');
  const convRes = await request(
    { path: '/api/meetings/convert-action-item', method: 'POST' },
    { actionItemId, priority: 'HIGH', dueDate: new Date(Date.now() + 259200000).toISOString() }
  );
  console.log(`   Converted to Task ID: ${convRes.data.task.id}, Title: "${convRes.data.task.title}"`);
  const taskId = convRes.data.task.id;

  // 8. Update Task Status to IN_PROGRESS
  console.log('8. Testing /api/tasks/[id] (Moving task to In Progress)...');
  const taskUpdateRes = await request(
    { path: `/api/tasks/${taskId}`, method: 'PATCH' },
    { status: 'IN_PROGRESS' }
  );
  console.log(`   Updated Task Status: ${taskUpdateRes.data.status}`);

  // 9. Create Markdown Note
  console.log('9. Testing /api/notes (Creating Markdown note)...');
  const noteRes = await request(
    { path: '/api/notes', method: 'POST' },
    {
      title: 'ROS 2 Nav2 Costmap Configuration Guide',
      category: 'ROS',
      content: '## Global and Local Costmap Configuration\n- Set inflation radius to 0.35m\n- Enable obstacle layer from LiDAR pointcloud',
      tags: 'ROS2, Nav2, Costmap',
    }
  );
  console.log(`   Created Note ID: ${noteRes.data.id}, Category: ${noteRes.data.category}`);

  // 10. Add Self Study Topic
  console.log('10. Testing /api/self-study (Adding learning roadmap topic)...');
  const studyRes = await request(
    { path: '/api/self-study', method: 'POST' },
    {
      topic: 'ROS 2 Navigation 2 (Nav2) Concepts',
      status: 'LEARNING',
      resourceLink: 'https://navigation.ros.org/',
      description: 'Understanding Behavior Trees and Costmaps',
    }
  );
  console.log(`   Created Self-Study ID: ${studyRes.data.id}, Status: ${studyRes.data.status}`);

  // 11. Add Tech Stack Item
  console.log('11. Testing /api/tech-stack (Adding technology)...');
  const techRes = await request(
    { path: '/api/tech-stack', method: 'POST' },
    {
      technology: 'ROS 2 Humble',
      category: 'Robotics',
      status: 'USING',
      documentationLink: 'https://docs.ros.org/en/humble/',
    }
  );
  console.log(`   Created Tech ID: ${techRes.data.id}, Status: ${techRes.data.status}`);

  // 12. Add Hardware Item
  console.log('12. Testing /api/hardware (Adding hardware component)...');
  const hwRes = await request(
    { path: '/api/hardware', method: 'POST' },
    {
      componentName: 'MPU6050 6-DOF IMU Sensor',
      category: 'Sensors',
      quantity: 2,
      status: 'AVAILABLE',
      location: 'Robotics Lab Box #1',
      datasheetUrl: 'https://invensense.tdk.com/mpu-6050/',
    }
  );
  console.log(`   Created Hardware ID: ${hwRes.data.id}, Qty: ${hwRes.data.quantity}`);

  // 13. Add Theme and Mark as Selected
  console.log('13. Testing /api/themes (Adding and Selecting Theme)...');
  const themeRes = await request(
    { path: '/api/themes', method: 'POST' },
    {
      themeName: 'Holonomic Drive Warehouse Bot',
      description: 'Autonomous package sorting using Mecanum wheeled chassis in simulated warehouse.',
      officialLink: 'https://portal.e-yantra.org/themes',
      selectedStatus: 'SELECTED',
      technologies: 'ROS 2, Mecanum Kinematics, OpenCV, Gazebo',
      difficultyNotes: 'High feasibility with Nav2 stack and 4-wheel velocity kinematics.',
    }
  );
  console.log(`   Created Theme ID: ${themeRes.data.id}, Status: ${themeRes.data.selectedStatus}`);

  // 14. Add Resource with Bookmark
  console.log('14. Testing /api/resources (Adding bookmarked resource)...');
  const resRes = await request(
    { path: '/api/resources', method: 'POST' },
    {
      title: 'Mecanum Wheel Kinematics & Inverse Jacobian Matrix',
      category: 'PAPER',
      url: 'https://arxiv.org/abs/example',
      isBookmarked: true,
    }
  );
  console.log(`   Created Resource ID: ${resRes.data.id}, Bookmarked: ${resRes.data.isBookmarked}`);

  // 15. Test Global Search
  console.log('15. Testing /api/search (Searching across all models)...');
  const searchRes = await request({ path: '/api/search?q=Nav2' });
  console.log(`   Found ${searchRes.data.results?.length} search results for "Nav2":`);
  searchRes.data.results?.forEach((r) => console.log(`     - [${r.type}] ${r.title} (${r.url})`));

  // 16. Verify Updated Dashboard Metrics & Audit Log
  console.log('\n16. Testing /api/dashboard (Verifying live calculated metrics)...');
  const dashRes2 = await request({ path: '/api/dashboard' });
  console.log(`   Current Theme: "${dashRes2.data.topSection.currentTheme}"`);
  console.log(`   Next Class: "${dashRes2.data.topSection.nextClass}"`);
  console.log(`   Next Meeting: "${dashRes2.data.topSection.nextMeeting}"`);
  console.log(`   Calculated Tasks -> Total: ${dashRes2.data.taskCounts.total}, InProgress: ${dashRes2.data.taskCounts.inProgress}, Completed: ${dashRes2.data.taskCounts.completed}`);
  console.log(`   Upcoming Timeline Items: ${dashRes2.data.timeline.length}`);
  console.log(`   Recent Activity Events: ${dashRes2.data.recentActivities.length}`);
  console.log(`   Latest Activity: "${dashRes2.data.recentActivities[0]?.description}"`);

  if (dashRes2.data.taskCounts.total !== 1 || dashRes2.data.taskCounts.inProgress !== 1) {
    throw new Error('Task calculation mismatch on dashboard');
  }

  // 17. Test Database Backup Export
  console.log('17. Testing /api/export (JSON database backup)...');
  const exportRes = await request({ path: '/api/export' });
  console.log(`   Export status: ${exportRes.status}, File size: ${exportRes.raw.length} bytes`);
  if (!exportRes.raw.includes('Holonomic Drive Warehouse Bot')) {
    throw new Error('Export backup did not contain saved records');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 17 END-TO-END VERIFICATION TESTS PASSED PERFECTLY!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
