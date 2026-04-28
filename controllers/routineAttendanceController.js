const supabase = require('../config/supabaseClient');

const mergeAdminRecords = (adminRecords) => {
    const merged = {};
    if (!adminRecords) return merged;

    Object.values(adminRecords).forEach(userRecords => {
        Object.entries(userRecords).forEach(([userId, dayRecords]) => {
            if (!merged[userId]) {
                merged[userId] = {};
            }
            Object.entries(dayRecords).forEach(([day, attendanceData]) => {
                const existingData = merged[userId][day];

                if (!existingData) {
                    merged[userId][day] = attendanceData;
                    return;
                }

                if (attendanceData.status === 'absent') {
                    if (existingData.status === 'absent') {
                        if (attendanceData.timestamp > existingData.timestamp) {
                            merged[userId][day] = attendanceData;
                        }
                    } else {
                        merged[userId][day] = attendanceData;
                    }
                }
            });
        });
    });
    return merged;
};

const getAttendanceForMonth = async (req, res) => {
    try {
        const { routine, year, month } = req.params;
        const monthKey = `${routine}_${year}-${String(month).padStart(2, '0')}`;

        const { data, error } = await supabase
            .from('attendance_monthly')
            .select('*')
            .eq('routine', routine)
            .eq('year', parseInt(year))
            .eq('month', parseInt(month))
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            res.json(data);
        } else {
            res.json({ month_key: monthKey, routine, year: parseInt(year), month: parseInt(month), admin_records: {}, merged_records: {} });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { routine, year, month, adminId, userId, day, status, note } = req.body;
        const monthKey = `${routine}_${year}-${String(month).padStart(2, '0')}`;

        let { data: existingDoc } = await supabase
            .from('attendance_monthly')
            .select('*')
            .eq('routine', routine)
            .eq('year', year)
            .eq('month', month)
            .single();

        let adminRecords = existingDoc?.admin_records || {};
        let mergedRecords = existingDoc?.merged_records || {};

        if (!adminRecords[adminId]) {
            adminRecords[adminId] = {};
        }
        if (!adminRecords[adminId][userId]) {
            adminRecords[adminId][userId] = {};
        }

        adminRecords[adminId][userId][day] = {
            status,
            note: status === 'absent' ? note : '',
            timestamp: Date.now(),
        };

        mergedRecords = mergeAdminRecords(adminRecords);

        let result;
        if (existingDoc) {
            const { data, error } = await supabase
                .from('attendance_monthly')
                .update({
                    admin_records: adminRecords,
                    merged_records: mergedRecords
                })
                .eq('id', existingDoc.id)
                .select()
                .single();
            
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('attendance_monthly')
                .insert([{
                    month_key: monthKey,
                    routine,
                    year,
                    month,
                    admin_records: adminRecords,
                    merged_records: mergedRecords
                }])
                .select()
                .single();
            
            if (error) throw error;
            result = data;
        }

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

const getAttendanceReport = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide startDate and endDate' });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const startYear = start.getFullYear();
        const endYear = end.getFullYear();

        const { data: users, userError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, history')
            .neq('role', 'manager')
            .order('history.work_age', { ascending: false });

        if (userError) throw userError;

        const { data: attendanceDocs, attError } = await supabase
            .from('attendance_monthly')
            .select('*')
            .gte('year', startYear)
            .lte('year', endYear);

        if (attError) throw attError;

        const allAttendance = {};

        attendanceDocs.forEach(doc => {
            const docMonthStart = new Date(doc.year, doc.month - 1, 1);
            const docMonthEnd = new Date(doc.year, doc.month, 0, 23, 59, 59, 999);

            if (docMonthStart <= end && docMonthEnd >= start) {
                const routine = doc.routine;
                if (!allAttendance[routine]) {
                    allAttendance[routine] = {};
                }
                if (doc.merged_records) {
                    Object.entries(doc.merged_records).forEach(([userId, userDays]) => {
                        if (!allAttendance[routine][userId]) {
                            allAttendance[routine][userId] = {};
                        }

                        Object.entries(userDays).forEach(([day, dayData]) => {
                            const currentDay = new Date(doc.year, doc.month - 1, parseInt(day));
                            currentDay.setHours(12, 0, 0, 0);

                            if (currentDay >= start && currentDay <= end) {
                                allAttendance[routine][userId][day] = dayData;
                            }
                        });
                    });
                }
            }
        });

        const processedData = users.map(user => {
            const userReport = {
                uid: user.id,
                name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email,
                totalAbsences: 0,
                routineBreakdown: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 },
                absenceDetails: []
            };

            Object.entries(allAttendance).forEach(([routine, routineData]) => {
                const userData = routineData[user.id] || {};
                Object.entries(userData).forEach(([day, dayData]) => {
                    if (dayData.status === 'absent') {
                        userReport.totalAbsences++;
                        if (userReport.routineBreakdown[routine] !== undefined) {
                            userReport.routineBreakdown[routine]++;
                        } else {
                            userReport.routineBreakdown[routine] = 1;
                        }
                        userReport.absenceDetails.push({ routine, day: parseInt(day), note: dayData.note || '-' });
                    }
                });
            });
            return userReport;
        });

        res.json({ totalUsers: users.length, report: processedData });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAttendanceForMonth, updateAttendance, getAttendanceReport };