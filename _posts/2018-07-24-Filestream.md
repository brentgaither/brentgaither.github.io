---
layout: post
title:  Sql Filestream
---

<html>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="chrome=1">
    <link href='https://fonts.googleapis.com/css?family=Chivo:900' rel='stylesheet' type='text/css'>
    <!--[if lt IE 9]>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <title>Brentgaither.GitHub.io by brentgaither</title>
  </head>

  <body>
    <div id="container">
      <div class="inner">
        <hr>
        <section id="main_content">
        <h3>How do I store files?! </h3>
        <p>You have four main options, you can use a file share(map db rows to a file on a fileshare), a filetable (sql 2012 - store files in a predefined table from sql), a filestream (sql 2008 - varbinary column backed by ntfs), or a store them in the database as a blob or base64 string. Each of the different file storage implementations has its own advantages and disadvantages, I decided to use a filestream because of the file sizes I am dealing with, speed, file integrity and a requirement to send the files over a web api. Setting up a file system is a big task and no matter how you setup your file system there will be considerations.</p>

        <p>I wont get too into the pros and cons of all of the ways to store files, but the main points I want to bring up are file integrity vs ease of use. Blobs and file shares can be easier to implement, but fall short in speed and reliability. Blobs are heavy to store in the database and can add a lot of data and slow down performance. File shares lack integrity which can be a huge problem. A Filestream database can be harder to implement, but guarantees the files you pull from your db are backed by a file. Blobs guarantee that your file is still there, but for files over 1mb filestream greatly out performs blobs.</p>
        <h3>Setup a filestream database</h3>
        <p>To setup a filestream db you need to enable filestream on the server and setup the database to use the filestream. </p>
        <ul>
          <li>Go to SQL Server Configuration Manager.</li>
          <li>If you don't have sql configuration manager run sqlservermanager11.msc and add the confiuration manager snap-in right-click SQL Server Services, and open.</li>
          <li>In the SQL Server Configuration Manager snap-in, find  SQL Server instance you are enabling FILESTREAM</li>
          <li>Right-click and go to Properties.</li>
          <li>Click the FILESTREAM tab.</li>
          <li>Check the Enable FILESTREAM for Transact-SQL access check box.</li>
          <li>If you want to read and write FILESTREAM data from Windows, click Enable FILESTREAM for file I/O streaming access. Enter the name of the Windows share in the Windows Share Name box.</li>
          <li>If you are setting up a dotnet application to use the filestream you want to check this box.</li>
          <li>If remote clients must access the FILESTREAM data that is stored on this share, select allow remote clients to have streaming access to FILESTREAM data. If you are running your application with separate users for the db and for the app pool or if you are running the application from multiple web servers and db servers you will need to enable remote access.</li>
          <li>Hit Apply.</li>
        </ul>
        <p>Now you have file stream enabled lets create a database</p>

        {% highlight sql %}
        CREATE DATABASE FileStreamDb
        --You must restart the service once you run this!
        EXEC sp_configure filestream_access_level, 2
        RECONFIGURE
        ALTER DATABASE FileStreamDb
        ADD FILEGROUP files CONTAINS FILESTREAM
        GO
        ALTER DATABASE FileStreamDb
          ADD FILE ( NAME = N'MyFiles',
          FILENAME = N'C:\MyFiles' )  -- where you want to store your files
        TO FILEGROUP files
        GO
        USE [FileStreamDb]
        GO
        SET ANSI_NULLS ON
        GO
        SET QUOTED_IDENTIFIER ON
        GO
        CREATE TABLE [dbo].[SystemFile](
          [Id] [int] NOT NULL,
        	[FileId] [uniqueidentifier] ROWGUIDCOL  NOT NULL,
        	[FileData] [varbinary](max) FILESTREAM  NOT NULL,
        	[MimeType] [varchar](50) NOT NULL,
        	[FileName] [varchar](256) NOT NULL,
        	[Uploaded] [datetime] NOT NULL,
          PRIMARY KEY CLUSTERED
          (
            [Id] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF,
              IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
              FILESTREAM_ON [files],
          UNIQUE NONCLUSTERED
          (
            [FileId] ASC
            )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF,
              IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON,
              ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
            ) ON [PRIMARY] FILESTREAM_ON [files]
          GO
          ALTER TABLE [dbo].[SystemFile] ADD  DEFAULT (newsequentialid()) FOR [FileId]
          GO
        {% endhighlight %}


        <p> Now that you have your database all setup you need to get access to your db files through code. I am not going to go through all of the code since this article does a great job already.
        <a href="https://blog.tallan.com/2011/08/22/using-sqlfilestream-with-c-to-access-sql-server-filestream-data/" target="_blank">
        https://blog.tallan.com/2011/08/22/using-sqlfilestream-with-c-to-access-sql-server-filestream-data/</a> </p>

        <p>The main points you need to know are filestreams must use a transaction to stream the data and there is some manual configuration to get the sql filestream to work with the C# streaming. </p>

        <p>If you have files that you want to convert from a fileshare to use a filestream you can use the follow script:</p>
        {% highlight sql %}
        begin tran
          CREATE TABLE #tmpFolders(myFolderName VARCHAR(max));
           -- Where are your files that you want to convert?
          INSERT INTO #tmpFolders EXEC xp_cmdshell 'dir /B C:\CurrentFiles';
          CREATE TABLE #tmpFiles (myFileName VARCHAR(max));

          declare @folderName varchar(max)
          declare @fileName varchar(max)
          Declare @sql as nvarchar(max)

          -- Iterate through each folder in the directory
          While (Select Count(*) From #tmpFolders where myFolderName is not null) > 0
            Begin
            Select Top 1 @folderName = myFolderName From #tmpFolders
            declare @files table (ID int IDENTITY, FileName varchar(max))
            -- Where are your files that you want to convert?
            declare @currentFolder varchar(256) = 'C:\CurrentFiles'
            declare @fileId int = 0

            -- Go through all of the files in each folder
            declare @fileCommand varchar(256) = 'dir /B ' + @currentFolder + @folderName
            INSERT INTO #tmpFiles execute xp_cmdshell @fileCommand
            While (Select Count(*) From #tmpFiles where myFileName is not null) > 0
              Begin
              Select Top 1 @fileName = myFileName From #tmpFiles
              -- Load the image data and insert into the table
              -- (has to be dynamic you cant use variables in a open row set)
              Set @sql = 'Insert into FileStreamDb.dbo.systemfile
              (fileName, mimeType, uploaded, filedata)
              Select '''+ @fileName + ''',
              ''application/pdf'',
              ''' + cast(getdate() as varchar(256)) + ''',
              BulkColumn from Openrowset(Bulk''' +
              @currentFolder + @folderName + '\' + @fileName + ''', Single_Blob) as tt;
              SELECT @fileId = SCOPE_IDENTITY()
              print @sql
              EXECUTE sp_executesql @sql, N'@fileId INTEGER OUTPUT', @fileId OUTPUT
              -- here is the file id you just created you can use this for
              -- other meta data around the file if you need it
              print @fileId
              Delete from #tmpFiles Where myFileName = @fileName
            End
            truncate table #tmpFiles
            -- OPENROWSET processing goes here, using @folderName to identify which file to use
            Delete from #tmpFolders Where myFolderName = @folderName

          End

          DROP TABLE #tmpFolders
          DROP TABLE #tmpFiles


        rollback
        {% endhighlight %}
        </section>

      </div>
    </div>
  </body>
</html>
