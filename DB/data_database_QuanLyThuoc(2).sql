-- Bảng nhâ viên
insert into nhanvien (manv, hoten, chucvu, taikhoan, matkhau, trangthai, ngaytao) values
(1, N'Phạm Hoàng Minh', N'Nhân viên', 'minhp', '123', 1, '2025-09-01'),
(2, N'Lê Bảo Hạnh', N'Quản lý cửa hàng', 'hanhlb', '123', 1, '2025-09-02'),
(3, N'Trần Quốc Đạt', N'Nhân viên', 'datq', '123', 1, '2025-09-03'),
(4, N'Nguyễn Khánh Linh', N'Nhân viên', 'linh', '123', 1, '2025-09-04'),
(5, N'Trương Thiện Tài', N'Admin', 'tttai', '123', 1, '2025-09-05'),
(6, N'Võ Nhật Hào', N'Nhân viên', 'hao', '123', 1, '2025-09-06'),
(7, N'Huỳnh Quỳnh Như', N'Nhân viên', 'nhuq', '123', 1, '2025-09-07'),
(8, N'Lâm Hữu Tín', N'Nhân viên', 'tinhl', '123', 1, '2025-09-08'),
(9, N'Phan Quốc Vũ', N'Nhân viên', 'vu', '123', 1, '2025-09-09'),
(10, N'Nguyễn Phúc Khang', N'Nhân viên', 'khang', '123', 1, '2025-09-10'),
(11, N'Đỗ Mỹ Duyên', N'Nhân viên', 'duyen', '123', 1, '2025-09-11'),
(12, N'Phạm Vĩnh Kỳ', N'Nhân viên', 'kyv', '123', 1, '2025-09-12'),
(13, N'Trần Lê Hoàng', N'Nhân viên', 'hoang', '123', 1, '2025-09-13'),
(14, N'Đoàn Tấn Dũng', N'Nhân viên', 'dungt', '123', 1, '2025-09-14'),
(15, N'Trịnh Gia Bảo', N'Nhân viên', 'bao', '123', 1, '2025-09-15')

-- quyền truy cập 
insert into quyentruycap (maquyen, tenquyen, mota) values
(1, N'Admin', N'Toàn quyền hệ thống'),
(2, N'Nhân viên', N'Thực hiện bán hàng, nhập hàng'),
(3, N'Quản lý cửa hàng', N'Theo dõi hoạt động và doanh thu')

insert into phanquyen (manv, maquyen) values
(1,2),(2,3),(3,2),(4,2),(5,1),(6,2),(7,2),(8,2),(9,2),(10,2),
(11,2),(12,2),(13,2),(14,2),(15,2)

-- khách hàng
insert into khachhang (makh, hoten, sdt, email, diachi, matkhau, ngaytao) values
(1, N'Lê Tuấn Anh', '0905001001', N'tuananh@gmail.com', N'12 Lê Lai, Quận 1', N'123', '2025-09-10'),
(2, N'Phạm Thị Hoa', '0905111002', N'hoapham@gmail.com', N'24 Nguyễn Trãi, Quận 5', N'123', '2025-09-11'),
(3, N'Ngô Tấn Phát', '0905222003', N'phatngo@gmail.com', N'35 Võ Văn Ngân, Thủ Đức', N'123', '2025-09-12'),
(4, N'Huỳnh Thị Nga', '0905333004', N'ngahuynh@gmail.com', N'101 Lê Văn Việt, Thủ Đức', N'123', '2025-09-13'),
(5, N'Lê Đức Tài', '0905444005', N'taile@gmail.com', N'68 Bà Triệu, Quận 3', N'123', '2025-09-14'),
(6, N'Trần Nhật Hào', '0905555006', N'haotran@gmail.com', N'22 Lý Thường Kiệt, Quận 10', N'123', '2025-09-15'),
(7, N'Phan Quỳnh Mai', '0905666007', N'maiphan@gmail.com', N'56 Pasteur, Quận 3', N'123', '2025-09-16'),
(8, N'Nguyễn Duy Phúc', '0905777008', N'phucduy@gmail.com', N'18 Nguyễn Huệ, Quận 1', N'123', '2025-09-17'),
(9, N'Đoàn Hải Nam', '0905888009', N'namdoan@gmail.com', N'72 Nguyễn Văn Cừ, Quận 5', N'123', '2025-09-18'),
(10, N'Phùng Gia Huy', '0905999010', N'huyphung@gmail.com', N'9 Lê Quý Đôn, Quận 3', N'123', '2025-09-19'),
(11, N'Trương Mỹ Dung', '0905123011', N'dungtruong@gmail.com', N'55 Nguyễn Kiệm, Gò Vấp', N'123', '2025-09-20'),
(12, N'Võ Đức Anh', '0905234012', N'anhvo@gmail.com', N'33 Điện Biên Phủ, Bình Thạnh', N'123', '2025-09-21'),
(13, N'Đỗ Hữu Khải', '0905345013', N'khaid@gmail.com', N'47 Lê Văn Sỹ, Phú Nhuận', N'123', '2025-09-22'),
(14, N'Phạm Bảo Long', '0905456014', N'longpb@gmail.com', N'64 Nguyễn Oanh, Gò Vấp', N'123', '2025-09-23'),
(15, N'Lê Hoàng Tín', '0905567015', N'tinlh@gmail.com', N'70 Võ Thị Sáu, Quận 3', N'123', '2025-09-24')

-- các loại thuốc
insert into loaithuoc (maloai, tenloai) values
(1, N'Thuốc'),
(2, N'Tra cứu bệnh'),
(3, N'Thực phẩm bảo vệ sức khỏe'),
(4, N'Chăm sóc cá nhân'),
(5, N'Mẹ và Bé'),
(6, N'Chăm sóc sắc đẹp'),
(7, N'Thiết bị y tế'),
(8, N'Sản phẩm tiện lợi')

-- thuốc (chỗ này dựa trên chuẩn khảo sát thanh danh mục nha)
insert into thuoc (mathuoc, tenthuoc, hoatchat, sodangky, quycachdonggoi, donvitinh, giaban, soluongton, nhasx, loaithuoc, chongchidinh, lieudung, maloai) values
-- nhóm 1 là Thuốc
(1, N'Panadol Extra', N'Paracetamol 500mg', N'VN-12345-12', N'Hộp 10 viên', N'Vỉ', 16000, 120, N'GSK', N'Thuốc', N'Không dùng cho trẻ dưới 6 tuổi', N'Uống sau ăn', 1),
(2, N'Tiffy', N'Chlorpheniramine + Paracetamol', N'VN-54321-33', N'Hộp 10 viên', N'Vỉ', 12000, 80, N'DH Pharma', N'Thuốc', N'Phụ nữ mang thai hỏi bác sĩ', N'Uống sau ăn', 1),
(3, N'Efferalgan 500mg', N'Paracetamol', N'VN-98765-55', N'Hộp 16 viên', N'Viên sủi', 18000, 60, N'UPSA', N'Thuốc', N'Không dùng quá 4g/ngày', N'Hòa tan trong nước', 1),
(4, N'Amoxicillin 500mg', N'Amoxicillin', N'VN-11223-88', N'Hộp 20 viên', N'Vỉ', 30000, 90, N'Mekophar', N'Thuốc', N'Dị ứng penicillin', N'Uống 2 lần/ngày', 1),
(5, N'Omeprazol 20mg', N'Omeprazole', N'VN-44556-99', N'Hộp 14 viên', N'Vỉ', 28000, 70, N'SaVi', N'Thuốc', N'Không dùng cho trẻ nhỏ', N'Uống trước ăn sáng', 1),

-- nhóm 3 là thực phẩm bảo vệ sức khỏe
(6, N'Vitamin C 1000mg', N'Ascorbic acid', N'VN-34567-77', N'Hộp 10 viên', N'Vỉ', 25000, 100, N'DH Pharma', N'Thực phẩm bảo vệ sức khỏe', N'Không dùng quá liều', N'Uống buổi sáng', 3),
(7, N'Viên dầu cá Omega-3', N'Omega-3', N'VN-66554-12', N'Lọ 100 viên', N'Lọ', 180000, 50, N'Marphavet', N'Thực phẩm bảo vệ sức khỏe', N'Không dùng cho người dị ứng cá', N'Uống sau ăn', 3),
(8, N'Viên uống Vitamin Tổng hợp Centrum', N'Multivitamin', N'VN-77889-34', N'Hộp 60 viên', N'Hộp', 320000, 40, N'Pfizer', N'Thực phẩm bảo vệ sức khỏe', N'Trẻ em không dùng', N'Uống 1 viên mỗi sáng', 3),

-- nhóm 4 là chăm sóc sức khoẻ
(9, N'Nước súc miệng Listerine Cool Mint', N'Tinh dầu bạc hà', N'VN-90876-54', N'Chai 500ml', N'Chai', 75000, 30, N'Johnson & Johnson', N'Chăm sóc cá nhân', N'Không nuốt', N'Súc miệng 2 lần/ngày', 4),
(10, N'Kem đánh răng Colgate Total', N'Fluoride', N'VN-66778-88', N'Tuýp 180g', N'Tuýp', 38000, 100, N'Colgate Palmolive', N'Chăm sóc cá nhân', N'Không nuốt', N'Dùng sáng và tối', 4),
(11, N'Khăn giấy ướt Lifebuoy', N'Benzalkonium Chloride', N'VN-88900-77', N'Gói 50 tờ', N'Gói', 25000, 200, N'Unilever', N'Chăm sóc cá nhân', N'Không dùng cho vùng da hở', N'Dùng lau tay mặt', 4),

-- 5 Mẹ và Bé
(12, N'Sữa bột Friso Gold 4', N'DHA, Choline', N'VN-22233-77', N'Hộp 900g', N'Hộp', 520000, 50, N'FrieslandCampina', N'Mẹ và Bé', N'Trẻ dưới 2 tuổi không dùng', N'Pha với nước ấm 50°C', 5),
(13, N'Bỉm Moony M60', N'Cotton + Polymer', N'VN-44455-99', N'Gói 60 miếng', N'Gói', 380000, 40, N'Unicharm', N'Mẹ và Bé', N'Dành cho bé 7-12kg', N'Dùng 3-4 cái/ngày', 5),
(14, N'Khăn khô đa năng Mamamy', N'Cotton tự nhiên', N'VN-55566-88', N'Gói 100 tờ', N'Gói', 35000, 80, N'Mamamy', N'Mẹ và Bé', N'Không dùng lau vùng mắt', N'Dùng vệ sinh cho bé', 5),

-- 6 chăm sóc sắc đẹp
(15, N'Kem dưỡng ẩm Cetaphil', N'Glycerin', N'VN-11122-55', N'Hộp 50g', N'Hộp', 180000, 60, N'Galderma', N'Chăm sóc sắc đẹp', N'Không dùng trên vết thương', N'Bôi sáng và tối', 6),
(16, N'Bepanthen Cream', N'Dexpanthenol 5%', N'VN-99887-66', N'Tuýp 30g', N'Tuýp', 75000, 50, N'Bayer', N'Chăm sóc sắc đẹp', N'Không bôi lên vết thương hở', N'Bôi ngoài da', 6),
(17, N'Serum Vitamin C The Ordinary', N'Ascorbic acid 10%', N'VN-11234-77', N'Lọ 30ml', N'Lọ', 280000, 35, N'DECIEM', N'Chăm sóc sắc đẹp', N'Không dùng vùng mắt', N'Bôi trước khi ngủ', 6),

--7 thiết bị y tế 
(18, N'Máy đo huyết áp Omron HEM-7120', N'Bộ cảm biến áp suất', N'VN-44567-90', N'Hộp', N'Máy', 890000, 15, N'Omron', N'Thiết bị y tế', N'Không để nơi ẩm ướt', N'Do buổi sáng', 7),
(19, N'Nhiệt kế điện tử Microlife', N'Cảm biến nhiệt', N'VN-55678-12', N'Hộp 1 cái', N'Cái', 120000, 25, N'Microlife', N'Thiết bị y tế', N'Tránh làm rơi', N'Đo miệng hoặc nách', 7),

--8 sản phẩm tiện lợi
(20, N'Khẩu trang 4D Famapro', N'Vải kháng khuẩn', N'VN-66789-55', N'Hộp 50 cái', N'Hộp', 65000, 300, N'Famapro', N'Sản phẩm tiện lợi', N'Không tái sử dụng', N'Đeo che kín mũi miệng', 8),
(21, N'Bình nước thể thao Lock&Lock', N'Nhựa Tritan', N'VN-77890-11', N'Bình 700ml', N'Cái', 99000, 100, N'Lock&Lock', N'Sản phẩm tiện lợi', N'Tránh nước nóng >100°C', N'Dùng đựng nước', 8),
(22, N'Khăn giấy Tempo Pocket', N'Cellulose', N'VN-88991-22', N'Gói 10 tờ', N'Gói', 15000, 500, N'Tempo', N'Sản phẩm tiện lợi', N'Không ăn được', N'Dùng lau tay, lau mặt', 8)

-- nhà cung cấp
insert into nhacungcap (mancc, tenncc, sdt, diachi) values
(1, N'Công ty TNHH GSK Việt Nam', '0287778899', N'125 Nguyễn Thị Minh Khai, Quận 3'),
(2, N'Công ty Dược DH Pharma', '0281122334', N'56 Trường Sơn, Tân Bình'),
(3, N'Công ty UPSA Việt Nam', '0286677889', N'48 Cộng Hòa, Tân Bình'),
(4, N'Công ty Unilever Việt Nam', '0289988776', N'60 Điện Biên Phủ, Quận 1'),
(5, N'Công ty Bayer Việt Nam', '0282233445', N'12 Lê Thánh Tôn, Quận 1'),
(6, N'Công ty Mekophar', '0286655443', N'14 Lê Quang Định, Bình Thạnh'),
(7, N'Công ty SaVi Pharma', '0287755661', N'24 Phạm Văn Đồng, Thủ Đức'),
(8, N'Công ty Rohto Việt Nam', '0284455662', N'20 Trần Hưng Đạo, Quận 5'),
(9, N'Công ty Pharmacity Logistics', '0284455667', N'12 Đào Duy Anh, Phú Nhuận'),
(10, N'Công ty Mediplantex', '0283366998', N'48 Nguyễn Văn Cừ, Long Biên'),
(11, N'Công ty Traphaco', '0287788990', N'68 Nguyễn Văn Trỗi, Quận Phú Nhuận'),
(12, N'Công ty Domesco', '0285566771', N'50 Hai Bà Trưng, Quận 1'),
(13, N'Công ty Sanofi Việt Nam', '0288877662', N'72 Pasteur, Quận 3'),
(14, N'Công ty Pymepharco', '0283344552', N'85 Phan Xích Long, Quận Phú Nhuận'),
(15, N'Công ty DH Logistics', '0287788552', N'45 Phạm Hùng, Bình Chánh')

-- kho
insert into kho (makho, tenkho, diachi) values
(1, N'Kho chính Q1', N'12 Lê Lai, Quận 1'),
(2, N'Kho dự phòng Thủ Đức', N'101 Lê Văn Việt, Thủ Đức'),
(3, N'Kho vận chuyển Pharmacity', N'68 Bà Triệu, Quận 3'),
(4, N'Kho trung tâm Bình Thạnh', N'22 Điện Biên Phủ, Bình Thạnh'),
(5, N'Kho Unilever', N'60 Điện Biên Phủ, Quận 1'),
(6, N'Kho Bayer', N'12 Lê Thánh Tôn, Quận 1'),
(7, N'Kho Domesco', N'50 Hai Bà Trưng, Quận 1'),
(8, N'Kho UPSA', N'48 Cộng Hòa, Tân Bình'),
(9, N'Kho GSK', N'125 Nguyễn Thị Minh Khai, Quận 3'),
(10, N'Kho DH Pharma', N'56 Trường Sơn, Tân Bình'),
(11, N'Kho Traphaco', N'68 Nguyễn Văn Trỗi, Quận Phú Nhuận'),
(12, N'Kho Mekophar', N'14 Lê Quang Định, Bình Thạnh'),
(13, N'Kho Savi', N'24 Phạm Văn Đồng, Thủ Đức'),
(14, N'Kho Rohto', N'20 Trần Hưng Đạo, Quận 5'),
(15, N'Kho Pymepharco', N'85 Phan Xích Long, Quận Phú Nhuận')

-- lô thuốc
insert into lothuoc (malo, mathuoc, solo, ngaysanxuat, hansudung, soluongnhap, dongianhap, mancc, manv, ngaynhap) values
(1,1,'PAN2501','2025-01-10','2026-01-10',500,12000,1,3,'2025-01-15'),
(2,2,'TIF2502','2025-02-10','2026-02-10',300,9000,2,3,'2025-02-15'),
(3,3,'EFF2503','2025-03-10','2026-03-10',200,13000,3,3,'2025-03-15'),
(4,4,'SKI2504','2025-04-10','2026-04-10',100,30000,4,3,'2025-04-15'),
(5,5,'VIT2505','2025-05-10','2026-05-10',150,18000,2,3,'2025-05-15'),
(6,6,'AMO2506','2025-06-05','2026-06-05',250,25000,6,3,'2025-06-10'),
(7,7,'OME2507','2025-07-05','2026-07-05',200,22000,7,3,'2025-07-10'),
(8,8,'EYE2508','2025-08-01','2026-08-01',150,40000,8,3,'2025-08-05'),
(9,9,'ASP2509','2025-09-01','2027-09-01',350,25000,5,3,'2025-09-05'),
(10,10,'BEP2510','2025-10-01','2026-10-01',120,50000,5,3,'2025-10-05'),
(11,1,'PAN2511','2025-11-01','2026-11-01',400,11500,1,3,'2025-11-05'),
(12,2,'TIF2511','2025-11-05','2026-11-05',280,8500,2,3,'2025-11-10'),
(13,3,'EFF2511','2025-11-10','2026-11-10',300,12500,3,3,'2025-11-12'),
(14,4,'SKI2511','2025-11-15','2026-11-15',90,29500,4,3,'2025-11-18'),
(15,5,'VIT2511','2025-11-20','2026-11-20',200,17500,2,3,'2025-11-22')
-- tồn kho
insert into tonkho (malo, makho, soluongton) values
(1,1,400),(2,1,250),(3,1,180),(4,1,80),(5,1,140),
(6,1,230),(7,1,190),(8,1,120),(9,1,330),(10,1,100),
(11,1,300),(12,1,260),(13,1,270),(14,1,70),(15,1,180)

-- đơn thuốc
insert into donthuoc (madonthuoc, makh, tenbacsi, benhvien, chuandoan, ngaykethuoc, hinhanhdonthuoc) values
(1,1,N'Bs. Trịnh Ngọc Hân',N'BV Gia Định',N'Cảm cúm nhẹ','2025-10-01',null),
(2,2,N'Bs. Nguyễn Trung Đức',N'BV Đại học Y Dược',N'Đau đầu mãn tính','2025-10-02',null),
(3,3,N'Bs. Phan Hải Đăng',N'BV Quận 3',N'Sốt siêu vi','2025-10-03',null),
(4,4,N'Bs. Nguyễn Thị Loan',N'BV Tân Bình',N'Dị ứng ngoài da','2025-10-04',null),
(5,5,N'Bs. Lê Văn Long',N'BV Quận 1',N'Tiêu hóa kém','2025-10-05',null)

-- đơn hàng
insert into donhang (madh, makh, madonthuoc, ngaydat, trangthai, tongtien) values
(1,1,1,'2025-10-05',N'Hoàn tất',16000),
(2,2,2,'2025-10-06',N'Hoàn tất',25000),
(3,3,3,'2025-10-07',N'Hoàn tất',36000),
(4,4,4,'2025-10-08',N'Hoàn tất',45000),
(5,5,5,'2025-10-09',N'Hoàn tất',30000),
(6,6,null,'2025-10-10',N'Đang xử lý',0),
(7,7,null,'2025-10-11',N'Hủy',0),
(8,8,null,'2025-10-12',N'Hoàn tất',25000),
(9,9,null,'2025-10-13',N'Hoàn tất',40000),
(10,10,null,'2025-10-14',N'Hoàn tất',52000),
(11,11,null,'2025-10-15',N'Hoàn tất',12000),
(12,12,null,'2025-10-16',N'Hoàn tất',28000),
(13,13,null,'2025-10-17',N'Hoàn tất',75000),
(14,14,null,'2025-10-18',N'Hoàn tất',35000),
(15,15,null,'2025-10-19',N'Hoàn tất',45000)

-- chi tiết đơn hàng
insert into chitietdonhang (madh, malo, soluong, dongia, thanhtien) values
(1,1,1,16000,16000),
(2,5,1,25000,25000),
(3,3,2,18000,36000),
(4,4,1,45000,45000),
(5,2,2,15000,30000),
(8,5,1,25000,25000),
(9,9,2,20000,40000),
(10,8,1,52000,52000),
(11,2,1,12000,12000),
(12,7,1,28000,28000),
(13,10,1,75000,75000),
(14,9,1,35000,35000),
(15,4,1,45000,45000)
-- thanh toán
insert into thanhtoan (matt, madh, manv, phuongthuc, trangthai, ngaytt) values
(1,1,1,N'Tiền mặt',N'Đã thanh toán','2025-10-05'),
(2,2,1,N'Chuyển khoản',N'Đã thanh toán','2025-10-06'),
(3,3,2,N'Chuyển khoản',N'Đã thanh toán','2025-10-07'),
(4,4,6,N'Tiền mặt',N'Đã thanh toán','2025-10-08'),
(5,5,7,N'Chuyển khoản',N'Đã thanh toán','2025-10-09'),
(6,8,6,N'Tiền mặt',N'Đã thanh toán','2025-10-12'),
(7,9,7,N'Chuyển khoản',N'Đã thanh toán','2025-10-13'),
(8,10,8,N'Chuyển khoản',N'Đã thanh toán','2025-10-14'),
(9,11,9,N'Tiền mặt',N'Đã thanh toán','2025-10-15'),
(10,12,10,N'Chuyển khoản',N'Đã thanh toán','2025-10-16'),
(11,13,11,N'Chuyển khoản',N'Đã thanh toán','2025-10-17'),
(12,14,12,N'Tiền mặt',N'Đã thanh toán','2025-10-18'),
(13,15,13,N'Chuyển khoản',N'Đã thanh toán','2025-10-19')

-- voucher khuyến mãi
insert into voucher (mavoucher, tenvoucher, giatri, loaigiamgia, dontoithieu, ngaybd, ngaykt, trangthai) values
(1,N'Giảm 10%',0.1,N'Phần trăm',10000,'2025-09-01','2025-12-31',N'Hoạt động'),
(2,N'Giảm 5.000đ',5000,N'Trực tiếp',0,'2025-09-01','2025-12-31',N'Hoạt động'),
(3,N'Giảm 20.000đ đơn trên 100k',20000,N'Trực tiếp',100000,'2025-09-01','2025-12-31',N'Hoạt động')

insert into apdungvoucher (mavoucher, madh) values
(1,2),(2,5),(3,13)

-- phiếu nhập hàng
insert into phieunhaphang (mapn, mancc, manv, ngaynhap, tongtien, ghichu) values
(1,1,4,'2025-10-02',6000000,N'Nhập lô Panadol Extra'),
(2,2,4,'2025-10-03',3000000,N'Nhập lô Tiffy'),
(3,3,4,'2025-10-04',2500000,N'Nhập lô Efferalgan'),
(4,4,4,'2025-10-05',4000000,N'Nhập mỹ phẩm SkinCare'),
(5,5,4,'2025-10-06',5000000,N'Nhập Bepanthen Cream')
-- chi tiết phiếu nhập hàng
insert into chitietphieunhap (mapn, mathuoc, solo, ngaysanxuat, hansudung, soluong, dongia) values
(1,1,'PAN2501','2025-01-10','2026-01-10',500,12000),
(2,2,'TIF2502','2025-02-10','2026-02-10',300,9000),
(3,3,'EFF2503','2025-03-10','2026-03-10',200,13000),
(4,4,'SKI2504','2025-04-10','2026-04-10',100,30000),
(5,5,'VIT2505','2025-05-10','2026-05-10',150,18000);


-- Đơn đặt hàng
insert into dondathang (maddh, mancc, manv, ngaydat, tongtien, trangthai) values
(1, 1, 2, '2025-09-25', 6000000, N'Đã nhận hàng'),
(2, 2, 2, '2025-09-26', 3000000, N'Đã nhận hàng'),
(3, 3, 2, '2025-09-27', 2500000, N'Đã nhận hàng'),
(4, 4, 2, '2025-09-28', 4000000, N'Đã nhận hàng'),
(5, 5, 2, '2025-09-29', 5000000, N'Đã nhận hàng')

-- Chi tiết đơn đặt hàng (sau đó mới chạy)
insert into chitietdondathang (maddh, mathuoc, soluong, dongia) values
(1, 1, 500, 12000),
(2, 2, 300, 9000),
(3, 3, 200, 13000),
(4, 4, 100, 30000),
(5, 5, 150, 18000)

-- chi tiết đơn thuốc
insert into chitietdonthuoc (madonthuoc, mathuoc, soluong, lieudung) values
(1,2,2,N'Uống 2 lần/ngày'),
(2,1,1,N'Uống 1 viên khi đau đầu'),
(3,3,2,N'Uống 3 lần/ngày sau bữa ăn'),
(4,4,1,N'Bôi ngoài da ngày 2 lần'),
(5,5,1,N'Uống 1 viên sáng sớm')

-- báo cáo 
insert into baocao (mabc, loaibaocao, ngaylap, manv, noidung) values
(1,N'Doanh thu ngày','2025-10-05',4,N'Doanh thu bán lẻ ngày 05/10 đạt 41.000đ'),
(2,N'Nhập kho','2025-10-07',3,N'Nhập 5 lô thuốc mới vào kho chính'),
(3,N'Tồn kho','2025-10-10',2,N'Kiểm kê tồn kho đạt 2500 sản phẩm'),
(4,N'Thanh toán','2025-10-15',4,N'Tất cả hóa đơn trong tuần đã hoàn tất')
