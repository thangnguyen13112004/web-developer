SELECT 
    fk.name AS FK_Name,
    tp.name AS TableName,
    cp.name AS ColumnName
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
WHERE fk.referenced_object_id = OBJECT_ID('thuoc');





-- Tắt constraint khóa ngoại ở các bảng con
ALTER TABLE chitietdondathang NOCHECK CONSTRAINT ALL;
ALTER TABLE chitietdonthuoc NOCHECK CONSTRAINT ALL;
ALTER TABLE lothuoc NOCHECK CONSTRAINT ALL;
ALTER TABLE chitietphieunhap NOCHECK CONSTRAINT ALL;
ALTER TABLE thuoc NOCHECK CONSTRAINT ALL;

-- Xóa dữ liệu
DELETE FROM thuoc;

-- Bật lại constraint
ALTER TABLE chitietdondathang CHECK CONSTRAINT ALL;
ALTER TABLE chitietdonthuoc CHECK CONSTRAINT ALL;
ALTER TABLE lothuoc CHECK CONSTRAINT ALL;
ALTER TABLE chitietphieunhap CHECK CONSTRAINT ALL;
ALTER TABLE thuoc CHECK CONSTRAINT ALL;

insert into thuoc (mathuoc, tenthuoc, hoatchat, sodangky, quycachdonggoi, donvitinh, giaban, soluongton, nhasx, loaithuoc, chongchidinh, lieudung, maloai, hinhanh, giacu) values
-- nhóm 1 là Thuốc
(1, N'Panadol Extra', N'Paracetamol 500mg', N'VN-12345-12', N'Hộp 10 viên', N'Vỉ', 16000, 120, N'GSK', N'Thuốc', N'Không dùng cho trẻ dưới 6 tuổi', N'Uống sau ăn', 1, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20241107084419-0-P09747.png?versionId=ac43nT9Txx1zsFYPWwKy.4GHVpJwSeq6', 20000),
(2, N'Tiffy', N'Chlorpheniramine + Paracetamol', N'VN-54321-33', N'Hộp 10 viên', N'Vỉ', 12000, 80, N'DH Pharma', N'Thuốc', N'Phụ nữ mang thai hỏi bác sĩ', N'Uống sau ăn', 1, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415090613-0-P00424.jpg?versionId=KP1eY5_SNa8qaRC2TWgvpTRTMVc4A7eo', NULL),
(3, N'Efferalgan 500mg', N'Paracetamol', N'VN-98765-55', N'Hộp 16 viên', N'Viên sủi', 18000, 60, N'UPSA', N'Thuốc', N'Không dùng quá 4g/ngày', N'Hòa tan trong nước', 1, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415090637-0-P00126.jpg?versionId=PKFdUTErn2kexONhvlpyF8tABWfiwIGh', 22000),
(4, N'Amoxicillin 500mg', N'Amoxicillin', N'VN-11223-88', N'Hộp 20 viên', N'Vỉ', 30000, 90, N'Mekophar', N'Thuốc', N'Dị ứng penicillin', N'Uống 2 lần/ngày', 1, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250423015907-0-P00883.jpg?versionId=Lb4FkfMKWQVwBAGy.YczHMRgyzp0JZJR', NULL),
(5, N'Omeprazol 20mg', N'Omeprazole', N'VN-44556-99', N'Hộp 14 viên', N'Vỉ', 28000, 70, N'SaVi', N'Thuốc', N'Không dùng cho trẻ nhỏ', N'Uống trước ăn sáng', 1, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415102506-0-P04858.png?versionId=AI4cT0205xMUQVClgkUewJooJWvuLX.6', 35000),

-- nhóm 3 là thực phẩm bảo vệ sức khỏe
(6, N'Vitamin C 1000mg', N'Ascorbic acid', N'VN-34567-77', N'Hộp 10 viên', N'Vỉ', 25000, 100, N'DH Pharma', N'Thực phẩm bảo vệ sức khỏe', N'Không dùng quá liều', N'Uống buổi sáng', 3, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415090324-0-P25904.jpg?versionId=bc3YDwptN.45LJfHbJWgRM9vnSLNY_pT', NULL),
(7, N'Viên dầu cá Omega-3', N'Omega-3', N'VN-66554-12', N'Lọ 100 viên', N'Lọ', 180000, 50, N'Marphavet', N'Thực phẩm bảo vệ sức khỏe', N'Không dùng cho người dị ứng cá', N'Uống sau ăn', 3, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/product/20250418083412-0-P25542.jpg?versionId=x4z.3YTjTq4igCORV7gHetqPhmWqO4Ll', 200000),
(8, N'Viên uống Vitamin Tổng hợp Centrum', N'Multivitamin', N'VN-77889-34', N'Hộp 60 viên', N'Hộp', 320000, 40, N'Pfizer', N'Thực phẩm bảo vệ sức khỏe', N'Trẻ em không dùng', N'Uống 1 viên mỗi sáng', 3, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415090401-0-P22151.jpg?versionId=k_huNJN2zbLdBeYSQ9NqmOgrBl0GPrl0', NULL),

-- nhóm 4 là chăm sóc sức khoẻ
(9, N'Nước súc miệng Listerine Cool Mint', N'Tinh dầu bạc hà', N'VN-90876-54', N'Chai 500ml', N'Chai', 75000, 30, N'Johnson & Johnson', N'Chăm sóc cá nhân', N'Không nuốt', N'Súc miệng 2 lần/ngày', 4, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/promotion_sku_images/20251106075511-1-P29942.png?versionId=gpcQmzQaiLU9su6aU1PExvVb9Ym4N.60', NULL),
(10, N'Kem đánh răng Colgate Total', N'Fluoride', N'VN-66778-88', N'Tuýp 180g', N'Tuýp', 38000, 100, N'Colgate Palmolive', N'Chăm sóc cá nhân', N'Không nuốt', N'Dùng sáng và tối', 4, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20240930044529-0-P27991.jpg', 45000),
(11, N'Khăn giấy ướt Lifebuoy', N'Benzalkonium Chloride', N'VN-88900-77', N'Gói 50 tờ', N'Gói', 25000, 200, N'Unilever', N'Chăm sóc cá nhân', N'Không dùng cho vùng da hở', N'Dùng lau tay mặt', 4, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250508080759-0-P10983.png?versionId=w3q8GykE8FOhRQcnLOIfwYXuvRi535b9', NULL),

-- 5 Mẹ và Bé
(12, N'Sữa bột Friso Gold 4', N'DHA, Choline', N'VN-22233-77', N'Hộp 900g', N'Hộp', 520000, 50, N'FrieslandCampina', N'Mẹ và Bé', N'Trẻ dưới 2 tuổi không dùng', N'Pha với nước ấm 50°C', 5, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/product/20250424035734-0-P22189_1.jpg?versionId=UX4b4HhYk__0RMG0tloLu3a6D32sqNYP', 550000),
(13, N'Bỉm Moony M60', N'Cotton + Polymer', N'VN-44455-99', N'Gói 60 miếng', N'Gói', 380000, 40, N'Unicharm', N'Mẹ và Bé', N'Dành cho bé 7-12kg', N'Dùng 3-4 cái/ngày', 5, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQA9Q4tPDr7UEKcJGyibBiLTNVga21LHcqbzEhzSFa0_3TymHOQSGIJIkdLVHnl762YDBvi0uinfsdPuCeL9V2eNJf7z5vbdzSYvBemZiW0SVSKo7fvG4i0bee6AlH7JfXAtnZqAzY&usqp=CAc', NULL),
(14, N'Khăn khô đa năng Mamamy', N'Cotton tự nhiên', N'VN-55566-88', N'Gói 100 tờ', N'Gói', 35000, 80, N'Mamamy', N'Mẹ và Bé', N'Không dùng lau vùng mắt', N'Dùng vệ sinh cho bé', 5, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415090503-0-P03217.jpg?versionId=yRpZ50rJpmT.zKGCfJEs8rmNtBY9xW6E', NULL),

-- 6 chăm sóc sắc đẹp
(15, N'Kem dưỡng ẩm Cetaphil', N'Glycerin', N'VN-11122-55', N'Hộp 50g', N'Hộp', 180000, 60, N'Galderma', N'Chăm sóc sắc đẹp', N'Không dùng trên vết thương', N'Bôi sáng và tối', 6, 'https://placehold.co/300x300/EBF3FA/1B51A6?text=Cetaphil', NULL),
(16, N'Bepanthen Cream', N'Dexpanthenol 5%', N'VN-99887-66', N'Tuýp 30g', N'Tuýp', 75000, 50, N'Bayer', N'Chăm sóc sắc đẹp', N'Không bôi lên vết thương hở', N'Bôi ngoài da', 6, 'https://placehold.co/300x300/EBF3FA/1B51A6?text=Bepanthen', NULL),
(17, N'Serum Vitamin C The Ordinary', N'Ascorbic acid 10%', N'VN-11234-77', N'Lọ 30ml', N'Lọ', 280000, 35, N'DECIEM', N'Chăm sóc sắc đẹp', N'Không dùng vùng mắt', N'Bôi trước khi ngủ', 6, 'https://placehold.co/300x300/EBF3FA/1B51A6?text=The+Ordinary', 310000),

--7 thiết bị y tế 
(18, N'Máy đo huyết áp Omron HEM-7120', N'Bộ cảm biến áp suất', N'VN-44567-90', N'Hộp', N'Máy', 890000, 15, N'Omron', N'Thiết bị y tế', N'Không để nơi ẩm ướt', N'Do buổi sáng', 7, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20250415024127-0-P26439.jpg?versionId=3ox_nqSw..ct7OJ.yEVh6M_S1yuzF.tG', 950000),
(19, N'Nhiệt kế điện tử Microlife', N'Cảm biến nhiệt', N'VN-55678-12', N'Hộp 1 cái', N'Cái', 120000, 25, N'Microlife', N'Thiết bị y tế', N'Tránh làm rơi', N'Đo miệng hoặc nách', 7, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/ecommerce/20241107084408-0-P08457.png?versionId=gXHFd8QgTHwbRtCpdoijnnr5H4KULAq9', NULL),

--8 sản phẩm tiện lợi
(20, N'Khẩu trang 4D Famapro', N'Vải kháng khuẩn', N'VN-66789-55', N'Hộp 50 cái', N'Hộp', 65000, 300, N'Famapro', N'Sản phẩm tiện lợi', N'Không tái sử dụng', N'Đeo che kín mũi miệng', 8, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/product/20250918040932-0-P29785.png?versionId=z4NkuM4INacFQne4UTkrJzXSExOlcgnC', NULL),
(21, N'Bình nước thể thao Lock&Lock', N'Nhựa Tritan', N'VN-77890-11', N'Bình 700ml', N'Cái', 99000, 100, N'Lock&Lock', N'Sản phẩm tiện lợi', N'Tránh nước nóng >100°C', N'Dùng đựng nước', 8, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRM8lK3bRfHPVKPue3IJd4bZXF3iiMFHm9yCKNdbfiynbwUx-EhIqEVUl6l48TXk3GGaCp51y8cFm_iDDTQay42Va0k3iQZiTPg_rV_Syn26kxpVLkpxILFjgpHA4mn3aS1sqEsnA&usqp=CAc', 120000),
(22, N'Khăn giấy Tempo Pocket', N'Cellulose', N'VN-88991-22', N'Gói 10 tờ', N'Gói', 15000, 500, N'Tempo', N'Sản phẩm tiện lợi', N'Không ăn được', N'Dùng lau tay, lau mặt', 8, 'https://production-cdn.pharmacity.io/digital/320x320/plain/e-com/images/product/20250730100840-0-P22445_21.jpg?versionId=QVi.HzcJlRF02zIIviXcpkW5Rx44kU_b', NULL)
GO