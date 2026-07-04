import hashlib


class HashService:

    @staticmethod
    def calculate_hash(file_path: str) -> str:

        sha256 = hashlib.sha256()

        with open(file_path, "rb") as file:

            while True:

                data = file.read(4096)

                if not data:
                    break

                sha256.update(data)

        return sha256.hexdigest()


hash_service = HashService()